/**
 * Pluggy REST API Service
 * Gerencia autenticação e busca de dados financeiros via API do Pluggy.
 *
 * Fluxo:
 *  1. POST /auth  → obtém apiKey (válida por 2h)
 *  2. GET /items/{id}  → cada conexão (item), ids vindos de VUE_APP_PLUGGY_ITEM_IDS
 *  3. GET /accounts?itemId=  → contas de cada item
 *  4. GET /transactions?accountId=  → transações de cada conta
 */

const BASE_URL = 'https://api.pluggy.ai';

let cachedApiKey = null;
let apiKeyExpiresAt = null;

/**
 * Autentica no Pluggy e retorna a apiKey.
 * A chave é cacheada por 1h55m (validade real é 2h).
 */
async function getApiKey() {
  const now = Date.now();

  if (cachedApiKey && apiKeyExpiresAt && now < apiKeyExpiresAt) {
    return cachedApiKey;
  }

  const clientId = process.env.VUE_APP_PLUGGY_CLIENT_ID;
  const clientSecret = process.env.VUE_APP_PLUGGY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Credenciais do Pluggy não configuradas no .env (VUE_APP_PLUGGY_CLIENT_ID e VUE_APP_PLUGGY_CLIENT_SECRET).');
  }

  const response = await fetch(`${BASE_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Erro ao autenticar no Pluggy (${response.status})`);
  }

  const data = await response.json();
  cachedApiKey = data.apiKey;
  // Expira cache 5 minutos antes do tempo real (2h)
  apiKeyExpiresAt = now + (1 * 60 * 60 * 1000) + (55 * 60 * 1000);

  return cachedApiKey;
}

/**
 * Faz uma requisição autenticada para a API do Pluggy.
 */
async function pluggyFetch(path, options = {}) {
  const apiKey = await getApiKey();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Erro na API Pluggy (${response.status}): ${path}`);
  }

  return response.json();
}

/**
 * Gera um connectToken de curta duração (30min) para abrir o Pluggy Connect Widget.
 * @param {string|null} itemId - Se informado, reabre a conexão de um item existente.
 * @returns {Promise<string>} accessToken
 */
export async function createConnectToken(itemId = null) {
  const body = itemId ? { itemId } : {};
  const data = await pluggyFetch('/connect_token', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return data.accessToken;
}

/**
 * Carrega o script do Pluggy Connect Widget via CDN (idempotente).
 * @returns {Promise<void>}
 */
export function loadPluggyConnectScript() {
  return new Promise((resolve, reject) => {
    if (window.PluggyConnect) {
      resolve();
      return;
    }
    const existing = document.getElementById('pluggy-connect-script');
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.id = 'pluggy-connect-script';
    script.src = 'https://cdn.pluggy.ai/pluggy-connect/v2.5.0/pluggy-connect.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Falha ao carregar o Pluggy Connect Widget.'));
    document.head.appendChild(script);
  });
}

/**
 * Busca todos os items (conexões bancárias) disponíveis.
 * @returns {Promise<Array>}
 */
export async function fetchItems() {
  // A API da Pluggy não possui listagem de items (GET /items); só GET /items/{id}.
  const ids = (process.env.VUE_APP_PLUGGY_ITEM_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);

  if (!ids.length) {
    throw new Error('Nenhum Item ID configurado. Defina VUE_APP_PLUGGY_ITEM_IDS no .env (IDs separados por vírgula, copiados do Dashboard da Pluggy).');
  }

  return Promise.all(ids.map(id => pluggyFetch(`/items/${id}`)));
}

/**
 * Busca todas as contas de um item.
 * @param {string} itemId
 * @returns {Promise<Array>}
 */
export async function fetchAccounts(itemId) {
  const data = await pluggyFetch(`/accounts?itemId=${itemId}`);
  return data.results || [];
}

/**
 * Busca transações de uma conta via GET /v2/transactions (paginação por cursor;
 * o endpoint v1 /transactions foi descontinuado e responde 410).
 * @param {string} accountId
 * @param {object} options  - { from, to, maxPages } (from/to no formato yyyy-mm-dd)
 * @returns {Promise<{results: Array, total: number}>}
 */
export async function fetchTransactions(accountId, options = {}) {
  const params = new URLSearchParams({ accountId });

  if (options.from) params.append('dateFrom', options.from);
  if (options.to) params.append('dateTo', options.to);

  const maxPages = options.maxPages || 10;
  const results = [];
  let query = `?${params.toString()}`;

  for (let page = 0; query && page < maxPages; page++) {
    const data = await pluggyFetch(`/v2/transactions${query}`);
    results.push(...(data.results || []));
    // `next` já vem como query string pronta (ou null na última página)
    query = data.next || null;
  }

  return { results, total: results.length };
}

/**
 * Busca todas as transações de todos os items e contas disponíveis,
 * retornando uma lista plana ordenada da mais recente para a mais antiga.
 * @param {object} options - { from, to } (yyyy-mm-dd)
 * @returns {Promise<Array>}
 */
export async function fetchAllTransactions(options = {}) {
  const items = await fetchItems();

  if (!items.length) return [];

  const allTransactions = [];

  for (const item of items) {
    const accounts = await fetchAccounts(item.id);

    for (const account of accounts) {
      const { results } = await fetchTransactions(account.id, options);

      results.forEach(tx => {
        allTransactions.push({
          ...tx,
          accountName: account.name || account.number || 'Conta',
          accountType: account.type,
          institutionName: item.connector?.name || 'Instituição',
          institutionImageUrl: item.connector?.imageUrl || null,
        });
      });
    }
  }

  // Ordena pela data mais recente
  allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  return allTransactions;
}
