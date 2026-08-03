import supabase from '@/utils/supabase';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const API_KEY_STORAGE_KEY = 'deepseek-api-key';

// --- API Key Management ---

export function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

export function saveApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
    return true;
  }
  return false;
}

export function removeApiKey() {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
}

export function hasApiKey() {
  const key = getApiKey();
  return key && key.length > 10;
}

// --- Financial Context Builder ---

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

function getSalaryForMonth(month) {
  const saved = localStorage.getItem(`monthlySalary-${month}`);
  return saved ? JSON.parse(saved) : 0;
}

export async function buildFinancialContext() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return 'Não foi possível obter dados do usuário.';

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const salary = getSalaryForMonth(currentMonth);

    // Fetch all accounts (contas) for this user
    const { data: accounts, error: accError } = await supabase
      .from('account')
      .select('*')
      .eq('user_id', user.id);

    if (accError) throw accError;

    // Fetch current month parcels
    const startOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString();

    const { data: currentParcelas, error: cpError } = await supabase
      .from('account_parcelas')
      .select('*, account:id_account(ds_nome, categoria, dia_vencimento, user_id)')
      .gte('dt_vencimento', startOfMonth)
      .lte('dt_vencimento', endOfMonth);

    if (cpError) throw cpError;

    // Filter by user
    const userParcelas = currentParcelas.filter(p => p.account && p.account.user_id === user.id);

    // Fetch overdue parcels
    const { data: overdueParcelas, error: opError } = await supabase
      .from('account_parcelas')
      .select('*, account:id_account(ds_nome, categoria, dia_vencimento, user_id)')
      .lt('dt_vencimento', now.toISOString())
      .is('dt_pagamento', null);

    if (opError) throw opError;

    const userOverdue = overdueParcelas.filter(p => p.account && p.account.user_id === user.id);

    // Fetch next 3 months parcels for projection
    const endOf3Months = new Date(currentYear, currentMonth + 4, 0).toISOString();
    const { data: futureParcelas, error: fpError } = await supabase
      .from('account_parcelas')
      .select('*, account:id_account(ds_nome, categoria, dia_vencimento, user_id)')
      .gt('dt_vencimento', endOfMonth)
      .lte('dt_vencimento', endOf3Months)
      .is('dt_pagamento', null);

    if (fpError) throw fpError;

    const userFuture = futureParcelas.filter(p => p.account && p.account.user_id === user.id);

    // Build context strings
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const categoryLabels = {
      'despesas-fixas': 'Despesas Fixas',
      'transporte': 'Transporte',
      'alimentacao': 'Alimentação',
      'saude': 'Saúde',
      'educacao': 'Educação',
      'dividas-pagamentos': 'Dívidas e Pagamentos',
      'lazer-entretenimento': 'Lazer e Entretenimento',
      'manutencao-casa': 'Manutenção e Casa',
      'despesas-pessoais': 'Despesas Pessoais',
      'investimentos-poupanca': 'Investimentos e Poupança',
    };

    // Summaries
    const totalCurrentMonth = userParcelas.reduce((s, p) => s + Number(p.valor_parcela || 0), 0);
    const unpaidCurrentMonth = userParcelas.filter(p => !p.dt_pagamento);
    const totalUnpaid = unpaidCurrentMonth.reduce((s, p) => s + Number(p.valor_parcela || 0), 0);
    const paidCurrentMonth = userParcelas.filter(p => p.dt_pagamento);
    const totalPaid = paidCurrentMonth.reduce((s, p) => s + Number(p.valor_parcela || 0), 0);
    const totalOverdue = userOverdue.reduce((s, p) => s + Number(p.valor_parcela || 0), 0);

    // Group by category
    const byCategory = {};
    unpaidCurrentMonth.forEach(p => {
      const cat = p.account?.categoria || 'sem-categoria';
      const label = categoryLabels[cat] || cat;
      if (!byCategory[label]) byCategory[label] = { count: 0, total: 0, items: [] };
      byCategory[label].count++;
      byCategory[label].total += Number(p.valor_parcela || 0);
      byCategory[label].items.push(`${p.account?.ds_nome}: ${formatCurrency(p.valor_parcela)} (vence ${p.dt_vencimento})`);
    });

    // 70/20/10 analysis
    const ideal70 = salary * 0.7;
    const ideal20 = salary * 0.2;
    const ideal10 = salary * 0.1;

    const gastosGeraisCats = ['despesas-fixas', 'transporte', 'alimentacao', 'saude', 'educacao', 'manutencao-casa', 'lazer-entretenimento', 'despesas-pessoais'];
    const gastos70 = unpaidCurrentMonth.filter(p => gastosGeraisCats.includes(p.account?.categoria)).reduce((s, p) => s + Number(p.valor_parcela || 0), 0);
    const poupanca20 = unpaidCurrentMonth.filter(p => p.account?.categoria === 'investimentos-poupanca').reduce((s, p) => s + Number(p.valor_parcela || 0), 0);
    const dividas10 = unpaidCurrentMonth.filter(p => p.account?.categoria === 'dividas-pagamentos').reduce((s, p) => s + Number(p.valor_parcela || 0), 0);

    // Future projection
    const futureByMonth = {};
    userFuture.forEach(p => {
      const d = new Date(p.dt_vencimento);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!futureByMonth[key]) futureByMonth[key] = { total: 0, items: [] };
      futureByMonth[key].total += Number(p.valor_parcela || 0);
      futureByMonth[key].items.push(`${p.account?.ds_nome}: ${formatCurrency(p.valor_parcela)}`);
    });

    // All accounts summary
    const accountsSummary = (accounts || []).map(a =>
      `- ${a.ds_nome} | Categoria: ${categoryLabels[a.categoria] || a.categoria} | Valor Total: ${formatCurrency(a.valor_total)} | Dia Venc: ${a.dia_vencimento}`
    ).join('\n');

    // Build full context
    let context = `
=== DADOS FINANCEIROS DO USUÁRIO ===
Data atual: ${now.toLocaleDateString('pt-BR')} (${monthNames[currentMonth]} ${currentYear})

--- RENDA ---
Salário Mensal Informado: ${salary > 0 ? formatCurrency(salary) : 'NÃO INFORMADO'}

--- MÉTODO 70/20/10 (Distribuição Ideal) ---
70% Gastos Gerais: ${formatCurrency(ideal70)} → Gasto real: ${formatCurrency(gastos70)} (${salary > 0 ? Math.round((gastos70 / salary) * 100) : 0}%)
20% Poupança/Investimentos: ${formatCurrency(ideal20)} → Gasto real: ${formatCurrency(poupanca20)} (${salary > 0 ? Math.round((poupanca20 / salary) * 100) : 0}%)
10% Dívidas/Doações: ${formatCurrency(ideal10)} → Gasto real: ${formatCurrency(dividas10)} (${salary > 0 ? Math.round((dividas10 / salary) * 100) : 0}%)

--- RESUMO DO MÊS ATUAL (${monthNames[currentMonth]}) ---
Total de contas no mês: ${userParcelas.length} parcelas = ${formatCurrency(totalCurrentMonth)}
Contas pagas: ${paidCurrentMonth.length} parcelas = ${formatCurrency(totalPaid)}
Contas pendentes: ${unpaidCurrentMonth.length} parcelas = ${formatCurrency(totalUnpaid)}
Saldo restante estimado: ${salary > 0 ? formatCurrency(salary - totalUnpaid) : 'Salário não informado'}

--- CONTAS EM ATRASO ---
Total em atraso: ${userOverdue.length} parcelas = ${formatCurrency(totalOverdue)}`;

    if (userOverdue.length > 0) {
      context += '\nDetalhamento:';
      userOverdue.forEach(p => {
        context += `\n  - ${p.account?.ds_nome}: ${formatCurrency(p.valor_parcela)} (venceu em ${p.dt_vencimento})`;
      });
    }

    context += '\n\n--- CONTAS PENDENTES POR CATEGORIA (MÊS ATUAL) ---';
    for (const [cat, data] of Object.entries(byCategory)) {
      context += `\n${cat}: ${data.count} contas = ${formatCurrency(data.total)}`;
      data.items.forEach(item => {
        context += `\n  • ${item}`;
      });
    }

    if (Object.keys(futureByMonth).length > 0) {
      context += '\n\n--- PROJEÇÃO PRÓXIMOS 3 MESES ---';
      for (const [month, data] of Object.entries(futureByMonth)) {
        context += `\n${month}: ${formatCurrency(data.total)}`;
        data.items.forEach(item => {
          context += `\n  • ${item}`;
        });
      }
    }

    context += '\n\n--- TODAS AS CONTAS REGISTRADAS ---\n' + (accountsSummary || 'Nenhuma conta cadastrada.');

    return context;

  } catch (err) {
    console.error('Erro ao construir contexto financeiro:', err);
    return 'Erro ao carregar dados financeiros: ' + err.message;
  }
}

// --- System Prompt ---

function buildSystemPrompt(financialContext) {
  return `Você é um agente de economia pessoal altamente especializado e confiável. Seu nome é "Consultor Financeiro IA".

## REGRAS ABSOLUTAS (NUNCA VIOLE):
1. Você SOMENTE analisa e responde com base nos DADOS FINANCEIROS fornecidos abaixo. NUNCA invente números, contas, valores ou informações que não estejam nos dados.
2. Se um dado não estiver disponível (ex: salário não informado), DIGA EXPLICITAMENTE que o dado está ausente e peça ao usuário para informá-lo no sistema.
3. NUNCA alucine. Se não souber algo com base nos dados, diga "Não tenho essa informação nos seus dados cadastrados."
4. Responda SEMPRE em português brasileiro, de forma clara, objetiva e profissional.
5. Quando citar valores, use o formato R$ com duas casas decimais.
6. Você NÃO é um chatbot genérico. NÃO responda perguntas que não sejam sobre finanças pessoais, economia, orçamento ou gestão de contas.

## SUAS COMPETÊNCIAS:
- Analisar a distribuição de gastos usando o método 70/20/10
- Identificar contas em atraso e priorizar pagamentos
- Sugerir a estratégia "Bola de Neve" (pagar menor dívida primeiro) ou "Avalanche" (pagar maior juros primeiro)
- Propor renegociação de dívidas quando pertinente
- Calcular quanto o usuário pode economizar
- Projetar cenários futuros com base nos dados reais
- Identificar gastos desnecessários ou desproporcionais
- Sugerir redistribuição de contas entre meses quando possível
- Dar dicas práticas de economia baseadas na situação real do usuário

## ESTILO DE RESPOSTA:
- Seja direto e prático — o usuário quer soluções, não teoria
- Use emojis moderadamente para organizar a resposta (📊 💡 ⚠️ ✅)
- Estruture com tópicos e listas quando a resposta for longa
- Sempre termine com um plano de ação concreto quando aplicável
- Se o usuário estiver em situação crítica (muitas dívidas em atraso), seja empático mas realista

## DADOS FINANCEIROS DO USUÁRIO:
${financialContext}

Com base EXCLUSIVAMENTE nos dados acima, responda as perguntas do usuário sobre sua situação financeira.`;
}

// --- Chat API ---

export async function sendMessage(messages, financialContext) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API key do DeepSeek não configurada.');
  }

  const systemPrompt = buildSystemPrompt(financialContext);

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: apiMessages,
      temperature: 0.3,
      max_tokens: 2048,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('API key inválida. Verifique sua chave do DeepSeek.');
    }
    if (response.status === 402) {
      throw new Error('Saldo insuficiente na sua conta DeepSeek.');
    }
    if (response.status === 429) {
      throw new Error('Limite de requisições atingido. Aguarde alguns segundos.');
    }
    throw new Error(errorData.error?.message || `Erro da API (${response.status})`);
  }

  const data = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('A IA não retornou nenhuma resposta.');
  }

  return data.choices[0].message.content;
}

// --- Validate API Key ---

export async function validateApiKey(key) {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Olá' }],
        max_tokens: 5,
      }),
    });

    if (response.status === 401) return { valid: false, error: 'Chave inválida' };
    if (response.status === 402) return { valid: false, error: 'Sem saldo na conta' };
    if (response.ok) return { valid: true };

    return { valid: false, error: `Erro ${response.status}` };
  } catch (err) {
    return { valid: false, error: 'Não foi possível conectar à API' };
  }
}
