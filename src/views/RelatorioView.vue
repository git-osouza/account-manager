<template>
  <div class="relatorio-container">

    <!-- Header da Página -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="glass-card page-header p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h2 class="text-start mb-1 text-gradient-bright fw-bold">
              Relatório de Transações
            </h2>
            <p class="text-secondary mb-0">
              Conecte suas contas bancárias via Pluggy e visualize suas transações.
            </p>
          </div>
          <button
            class="btn-refresh d-flex align-items-center gap-2"
            :disabled="loadingTx"
            @click="loadTransactions"
          >
            <span :class="['refresh-icon', { spinning: loadingTx }]">🔄</span>
            <span>{{ loadingTx ? 'Carregando...' : 'Atualizar' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ===================== SEÇÃO: MINHAS CONEXÕES ===================== -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="glass-card p-0 overflow-hidden">
          <!-- Cabeçalho da seção -->
          <div class="section-header px-4 py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center gap-2">
              <span class="section-icon">🏦</span>
              <span class="fw-semibold text-white">Minhas Conexões Bancárias</span>
              <span v-if="items.length" class="count-badge">{{ items.length }}</span>
            </div>
            <button
              class="btn-connect d-flex align-items-center gap-2"
              :disabled="connectLoading"
              @click="openConnectWidget()"
            >
              <span v-if="connectLoading" class="pluggy-loader-sm" />
              <span v-else>➕</span>
              <span>{{ connectLoading ? 'Abrindo...' : 'Conectar Conta' }}</span>
            </button>
          </div>

          <!-- Loading dos items -->
          <div v-if="loadingItems" class="text-center py-4">
            <div class="pluggy-loader mx-auto mb-3" />
            <p class="text-secondary small mb-0">Buscando conexões...</p>
          </div>

          <!-- Lista de items (conexões) -->
          <div v-else-if="items.length > 0" class="items-list">
            <div
              v-for="item in items"
              :key="item.id"
              class="item-row d-flex align-items-center gap-3 px-4 py-3"
            >
              <!-- Logo da instituição -->
              <div class="institution-logo-wrapper">
                <img
                  v-if="item.connector?.imageUrl"
                  :src="item.connector.imageUrl"
                  :alt="item.connector.name"
                  class="institution-logo"
                />
                <span v-else class="institution-logo-fallback">🏦</span>
              </div>

              <!-- Info -->
              <div class="flex-grow-1">
                <div class="fw-semibold text-white small">{{ item.connector?.name || 'Instituição' }}</div>
                <div class="d-flex align-items-center gap-2 mt-1 flex-wrap">
                  <span :class="['item-status-badge', item.status === 'UPDATED' ? 'ok' : item.status === 'UPDATING' ? 'updating' : 'error']">
                    {{ statusLabel(item.status) }}
                  </span>
                  <span class="tx-meta">Atualizado: {{ item.lastUpdatedAt ? formatDate(item.lastUpdatedAt) : '—' }}</span>
                </div>
              </div>

              <!-- Ações -->
              <div class="d-flex gap-2">
                <button
                  class="item-action-btn"
                  title="Reconectar / atualizar"
                  @click="openConnectWidget(item.id)"
                >🔄</button>
              </div>
            </div>
          </div>

          <!-- Sem conexões -->
          <div v-else class="text-center py-5 px-4">
            <div class="empty-connect-icon mx-auto mb-3">🔗</div>
            <h6 class="fw-semibold text-white mb-1">Nenhuma conta conectada</h6>
            <p class="text-secondary small mb-4 max-width-para mx-auto">
              Clique em <strong class="text-light">Conectar Conta</strong> para vincular seu banco via Open Finance e visualizar suas transações aqui.
            </p>
            <button class="btn-connect d-inline-flex align-items-center gap-2" @click="openConnectWidget()">
              <span>➕</span> Conectar meu primeiro banco
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================== SEÇÃO: FILTROS ===================== -->
    <div class="row mb-4" v-if="!loadingTx && !errorTx && transactions.length > 0">
      <div class="col-12">
        <div class="glass-card filters-card p-3 d-flex flex-wrap align-items-center gap-3">
          <div class="filter-input-wrapper flex-grow-1">
            <span class="filter-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por descrição, categoria..."
              class="filter-input"
            />
          </div>

          <div class="d-flex gap-2 flex-wrap">
            <button
              v-for="type in typeFilters"
              :key="type.value"
              :class="['filter-chip', { active: selectedType === type.value }]"
              @click="selectedType = type.value; currentPage = 1"
            >{{ type.label }}</button>
          </div>

          <div class="d-flex gap-2 align-items-center">
            <input v-model="dateFrom" type="date" class="filter-date" title="De" />
            <span class="text-secondary small">até</span>
            <input v-model="dateTo" type="date" class="filter-date" title="Até" />
          </div>

          <span class="results-badge ms-auto">
            {{ filteredTransactions.length }} de {{ transactions.length }} transações
          </span>
        </div>
      </div>
    </div>

    <!-- ===================== SEÇÃO: TRANSAÇÕES ===================== -->

    <!-- Carregando transações -->
    <div v-if="loadingTx" class="row mt-2">
      <div class="col-12">
        <div class="glass-card py-5 text-center">
          <div class="pluggy-loader mx-auto mb-4" />
          <h5 class="fw-semibold text-white mb-2">Buscando transações...</h5>
          <p class="text-secondary small">Conectando às suas contas via Pluggy</p>
        </div>
      </div>
    </div>

    <!-- Erro transações -->
    <div v-else-if="errorTx" class="row mt-2">
      <div class="col-12">
        <div class="glass-card py-5 text-center">
          <div class="error-icon mx-auto mb-3">⚠️</div>
          <h5 class="fw-semibold text-white mb-2">Erro ao carregar transações</h5>
          <p class="text-secondary small mb-4 max-width-para mx-auto">{{ errorTx }}</p>
          <button class="btn-refresh" @click="loadTransactions">Tentar novamente</button>
        </div>
      </div>
    </div>

    <!-- Sem transações e sem conexões -->
    <div v-else-if="items.length === 0 && !loadingItems" class="row mt-2">
      <div class="col-12">
        <div class="glass-card py-4 text-center">
          <p class="text-secondary mb-0">Conecte uma conta acima para ver suas transações.</p>
        </div>
      </div>
    </div>

    <!-- Sem transações mas tem conexões -->
    <div v-else-if="!loadingTx && transactions.length === 0 && items.length > 0" class="row mt-2">
      <div class="col-12">
        <div class="glass-card py-5 text-center">
          <div class="empty-icon mx-auto mb-3">📭</div>
          <h5 class="fw-semibold text-white mb-2">Nenhuma transação encontrada</h5>
          <p class="text-secondary small max-width-para mx-auto">
            As conexões estão ativas mas não retornaram transações. Tente atualizar.
          </p>
        </div>
      </div>
    </div>

    <!-- Transações -->
    <div v-else-if="transactions.length > 0" class="row g-3">
      <!-- Cards resumo -->
      <div class="col-md-4">
        <div class="glass-card summary-card p-3 h-100">
          <span class="summary-label">Total de Entradas</span>
          <h4 class="fw-bold text-success-custom mt-1 mb-0">{{ formattedValue(totalCredits) }}</h4>
          <span class="summary-sub">{{ creditCount }} transações</span>
        </div>
      </div>
      <div class="col-md-4">
        <div class="glass-card summary-card p-3 h-100">
          <span class="summary-label">Total de Saídas</span>
          <h4 class="fw-bold text-danger-custom mt-1 mb-0">{{ formattedValue(totalDebits) }}</h4>
          <span class="summary-sub">{{ debitCount }} transações</span>
        </div>
      </div>
      <div class="col-md-4">
        <div class="glass-card summary-card p-3 h-100">
          <span class="summary-label">Saldo no Período</span>
          <h4 :class="['fw-bold mt-1 mb-0', balance >= 0 ? 'text-success-custom' : 'text-danger-custom']">
            {{ formattedValue(balance) }}
          </h4>
          <span class="summary-sub">{{ filteredTransactions.length }} transações exibidas</span>
        </div>
      </div>

      <!-- Tabela -->
      <div class="col-12 mt-2">
        <div class="glass-card p-0 overflow-hidden">
          <div class="table-header px-4 py-3 d-flex align-items-center gap-2">
            <span>📋</span>
            <span class="fw-semibold text-white">Histórico de Transações</span>
          </div>

          <div class="transactions-list">
            <div
              v-for="(tx, index) in paginatedTransactions"
              :key="tx.id || index"
              class="transaction-item"
            >
            <div
              class="transaction-row d-flex align-items-center gap-3 px-4 py-3"
              role="button"
              tabindex="0"
              @click="toggleDetails(tx.id || index)"
              @keyup.enter="toggleDetails(tx.id || index)"
            >
              <div :class="['tx-icon-wrapper', tx.type === 'CREDIT' ? 'credit' : 'debit']">
                <span>{{ tx.type === 'CREDIT' ? '↑' : '↓' }}</span>
              </div>

              <div class="flex-grow-1 min-width-0">
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <span class="tx-description text-truncate">{{ tx.description || tx.descriptionRaw || 'Sem descrição' }}</span>
                  <span v-if="tx.category" class="tx-category-badge">{{ tx.category }}</span>
                </div>
                <div class="d-flex align-items-center gap-2 mt-1 flex-wrap">
                  <span class="tx-meta">{{ tx.institutionName }}</span>
                  <span class="tx-meta-dot">·</span>
                  <span class="tx-meta">{{ tx.accountName }}</span>
                </div>
              </div>

              <div class="tx-date text-end d-none d-sm-block">{{ formatDate(tx.date) }}</div>

              <div class="tx-amount text-end">
                <span :class="tx.type === 'CREDIT' ? 'text-success-custom' : 'text-danger-custom'">
                  {{ tx.type === 'CREDIT' ? '+' : '-' }}{{ formattedValue(Math.abs(tx.amount)) }}
                </span>
              </div>

              <span class="tx-chevron">{{ expandedId === (tx.id || index) ? '▲' : '▼' }}</span>
            </div>

            <div v-if="expandedId === (tx.id || index)" class="tx-details px-4 py-3">
              <div class="row g-3">
                <div v-for="field in detailFields(tx)" :key="field.label" class="col-sm-6 col-lg-4">
                  <span class="detail-label">{{ field.label }}</span>
                  <div class="detail-value">{{ field.value }}</div>
                </div>
              </div>
            </div>
            </div>

            <div v-if="filteredTransactions.length === 0" class="text-center py-5">
              <p class="text-secondary">Nenhuma transação encontrada com os filtros aplicados.</p>
            </div>
          </div>

          <!-- Paginação -->
          <div
            v-if="totalPages > 1"
            class="pagination-bar px-4 py-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
          >
            <span class="text-secondary small">Página {{ currentPage }} de {{ totalPages }}</span>
            <div class="d-flex gap-2">
              <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">← Anterior</button>
              <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">Próxima →</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import {
  fetchItems,
  fetchAllTransactions,
  createConnectToken,
  loadPluggyConnectScript,
} from '@/services/pluggy/pluggyService';

export default {
  name: 'RelatorioView',
  setup() {
    const toast = useToast();

    // Estado: conexões (items)
    const items = ref([]);
    const loadingItems = ref(false);

    // Estado: widget
    const connectLoading = ref(false);

    // Estado: transações
    const transactions = ref([]);
    const loadingTx = ref(false);
    const errorTx = ref(null);

    // Filtros
    const searchQuery = ref('');
    const selectedType = ref('ALL');
    // Padrão: mês corrente (do dia 1 ao último dia)
    const toISODate = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const today = new Date();
    const dateFrom = ref(toISODate(new Date(today.getFullYear(), today.getMonth(), 1)));
    const dateTo = ref(toISODate(new Date(today.getFullYear(), today.getMonth() + 1, 0)));
    const currentPage = ref(1);
    const pageSize = 20;

    const typeFilters = [
      { label: '📊 Todas', value: 'ALL' },
      { label: '↑ Entradas', value: 'CREDIT' },
      { label: '↓ Saídas', value: 'DEBIT' },
    ];

    // ---- Conexões ----

    async function loadItems() {
      loadingItems.value = true;
      try {
        items.value = await fetchItems();
      } catch (err) {
        console.error('[Pluggy] Erro ao carregar items:', err);
        errorTx.value = err.message;
        toast.error('Pluggy: ' + err.message);
      } finally {
        loadingItems.value = false;
      }
    }

    async function openConnectWidget(itemId = null) {
      connectLoading.value = true;
      try {
        await loadPluggyConnectScript();
        const connectToken = await createConnectToken(itemId);

        const widget = new window.PluggyConnect({
          connectToken,
          includeSandbox: true,

          onSuccess: async (itemData) => {
            toast.success('Conta conectada com sucesso!');
            await loadItems();
            await loadTransactions();
            console.log('Item conectado:', itemData.item.id);
          },

          onError: (err) => {
            toast.error('Erro ao conectar a conta: ' + (err.message || err));
          },

          onClose: () => {
            // Widget fechado pelo usuário
          },
        });

        widget.init();
      } catch (err) {
        toast.error('Não foi possível abrir o Pluggy Connect: ' + err.message);
      } finally {
        connectLoading.value = false;
      }
    }

    // ---- Transações ----

    async function loadTransactions() {
      if (items.value.length === 0) return;
      loadingTx.value = true;
      errorTx.value = null;
      currentPage.value = 1;
      try {
        transactions.value = await fetchAllTransactions({
          from: dateFrom.value || undefined,
          to: dateTo.value || undefined,
        });
      } catch (err) {
        console.error('[Pluggy] Erro ao buscar transações:', err);
        errorTx.value = err.message;
        toast.error('Erro ao buscar transações do Pluggy.');
      } finally {
        loadingTx.value = false;
      }
    }

    // Mudou o período → busca de novo na Pluggy
    watch([dateFrom, dateTo], () => loadTransactions());

    onMounted(async () => {
      await loadItems();
      await loadTransactions();
    });

    // ---- Computed ----

    const filteredTransactions = computed(() => {
      let list = transactions.value;

      if (selectedType.value !== 'ALL') {
        list = list.filter(tx => tx.type === selectedType.value);
      }
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter(tx =>
          (tx.description || '').toLowerCase().includes(q) ||
          (tx.descriptionRaw || '').toLowerCase().includes(q) ||
          (tx.category || '').toLowerCase().includes(q) ||
          (tx.institutionName || '').toLowerCase().includes(q)
        );
      }
      if (dateFrom.value) list = list.filter(tx => tx.date >= dateFrom.value);
      if (dateTo.value) list = list.filter(tx => tx.date <= dateTo.value + 'T23:59:59');

      return list;
    });

    const totalPages = computed(() => Math.max(1, Math.ceil(filteredTransactions.value.length / pageSize)));
    const paginatedTransactions = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return filteredTransactions.value.slice(start, start + pageSize);
    });

    const totalCredits = computed(() =>
      filteredTransactions.value.filter(tx => tx.type === 'CREDIT').reduce((s, tx) => s + Math.abs(tx.amount), 0)
    );
    const totalDebits = computed(() =>
      filteredTransactions.value.filter(tx => tx.type === 'DEBIT').reduce((s, tx) => s + Math.abs(tx.amount), 0)
    );
    const balance = computed(() => totalCredits.value - totalDebits.value);
    const creditCount = computed(() => filteredTransactions.value.filter(tx => tx.type === 'CREDIT').length);
    const debitCount = computed(() => filteredTransactions.value.filter(tx => tx.type === 'DEBIT').length);

    // ---- Helpers ----

    function formattedValue(value) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }

    function formatDate(dateStr) {
      if (!dateStr) return '—';
      return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    const expandedId = ref(null);

    function toggleDetails(id) {
      expandedId.value = expandedId.value === id ? null : id;
    }

    function detailFields(tx) {
      const fields = [];
      const add = (label, value) => {
        if (value !== undefined && value !== null && value !== '') fields.push({ label, value });
      };
      const money = (v) => (typeof v === 'number' ? formattedValue(v) : v);
      const person = (p) => p && [p.name, p.documentNumber?.value].filter(Boolean).join(' · ');

      add('Descrição original', tx.descriptionRaw);
      add('Data', tx.date && new Date(tx.date).toLocaleString('pt-BR'));
      add('Status', tx.status === 'PENDING' ? 'Pendente' : tx.status === 'POSTED' ? 'Efetivada' : tx.status);
      add('Categoria', tx.category);
      add('Tipo de operação', tx.operationType);
      add('Conta', [tx.institutionName, tx.accountName].filter(Boolean).join(' · '));
      add('Saldo após a transação', money(tx.balance));
      if (tx.currencyCode && tx.currencyCode !== 'BRL') add('Moeda', tx.currencyCode);

      const m = tx.merchant;
      if (m) {
        add('Estabelecimento', m.name || m.businessName);
        add('Razão social', m.businessName !== m.name ? m.businessName : null);
        add('CNPJ', m.cnpj);
        add('Categoria do estabelecimento', m.category);
      }

      const c = tx.creditCardMetadata;
      if (c) {
        if (c.totalInstallments > 1) add('Parcela', `${c.installmentNumber}/${c.totalInstallments}`);
        add('Valor total da compra', money(c.totalAmount));
        add('Data da compra', c.purchaseDate && new Date(c.purchaseDate).toLocaleDateString('pt-BR'));
        add('Final do cartão', c.cardNumber);
      }

      const pd = tx.paymentData;
      if (pd) {
        add('Pagador', person(pd.payer));
        add('Recebedor', person(pd.receiver));
        add('Forma de pagamento', pd.paymentMethod);
        add('Motivo', pd.reason);
        add('Referência', pd.referenceNumber);
      }

      add('ID da transação', tx.id);
      return fields;
    }

    function statusLabel(status) {
      const map = {
        UPDATED: '✅ Atualizado',
        UPDATING: '🔄 Atualizando',
        WAITING_USER_INPUT: '⏳ Aguardando',
        LOGIN_ERROR: '❌ Erro de Login',
        ERROR: '❌ Erro',
      };
      return map[status] || status;
    }

    return {
      items, loadingItems,
      connectLoading, openConnectWidget,
      transactions, loadingTx, errorTx, loadTransactions,
      searchQuery, selectedType, dateFrom, dateTo,
      typeFilters, filteredTransactions, paginatedTransactions,
      currentPage, totalPages,
      totalCredits, totalDebits, balance, creditCount, debitCount,
      formattedValue, formatDate, statusLabel,
      expandedId, toggleDetails, detailFields,
    };
  },
};
</script>

<style scoped>
.relatorio-container { width: 100%; }

/* Header */
.page-header { border-left: 4px solid #6366f1; }

.text-gradient-bright {
  background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

/* Botão atualizar */
.btn-refresh {
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: #a5b4fc;
  padding: 0.55rem 1.1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-refresh:hover:not(:disabled) { background: rgba(99, 102, 241, 0.22); color: #fff; }
.btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

.refresh-icon { display: inline-block; transition: transform 0.5s ease; }
.refresh-icon.spinning { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Botão conectar */
.btn-connect {
  background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25));
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #c4b5fd;
  padding: 0.5rem 1.1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.btn-connect:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4));
  color: #fff;
  box-shadow: 0 4px 16px rgba(99,102,241,0.25);
}
.btn-connect:disabled { opacity: 0.5; cursor: not-allowed; }

/* Seção conexões */
.section-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
}
.section-icon { font-size: 1.1rem; }
.count-badge {
  background: rgba(99, 102, 241, 0.18);
  color: #a5b4fc;
  border-radius: 20px;
  padding: 0.1rem 0.55rem;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Lista de items */
.items-list { }
.item-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background-color 0.15s ease;
}
.item-row:last-child { border-bottom: none; }
.item-row:hover { background: rgba(255, 255, 255, 0.025); }

.institution-logo-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.institution-logo { width: 36px; height: 36px; object-fit: contain; border-radius: 8px; }
.institution-logo-fallback { font-size: 1.4rem; }

.item-status-badge {
  font-size: 0.72rem;
  font-weight: 600;
  border-radius: 6px;
  padding: 0.15rem 0.5rem;
}
.item-status-badge.ok { background: rgba(16,185,129,0.12); color: #10b981; }
.item-status-badge.updating { background: rgba(245,158,11,0.12); color: #f59e0b; }
.item-status-badge.error { background: rgba(244,63,94,0.1); color: #f43f5e; }

.item-action-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 0.35rem 0.55rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}
.item-action-btn:hover { background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.25); }

/* Ícone vazio conexões */
.empty-connect-icon {
  font-size: 2.5rem;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(99,102,241,0.08);
  border: 1px solid rgba(99,102,241,0.15);
}

/* Loaders */
.pluggy-loader {
  width: 44px; height: 44px;
  border: 3px solid rgba(99,102,241,0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.pluggy-loader-sm {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(196,181,253,0.3);
  border-top-color: #c4b5fd;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* Filtros */
.filters-card { border-color: rgba(255,255,255,0.06) !important; }
.filter-input-wrapper { position: relative; min-width: 200px; }
.filter-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.85rem; pointer-events: none; }
.filter-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: #fff; border-radius: 10px;
  padding: 0.45rem 0.75rem 0.45rem 2.1rem;
  font-size: 0.88rem; outline: none; transition: border-color 0.2s;
}
.filter-input:focus { border-color: rgba(99,102,241,0.4); }
.filter-input::placeholder { color: rgba(255,255,255,0.3); }

.filter-chip {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: var(--text-secondary); border-radius: 20px; padding: 0.35rem 0.85rem;
  font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; white-space: nowrap;
}
.filter-chip:hover { background: rgba(255,255,255,0.07); color: #fff; }
.filter-chip.active { background: rgba(99,102,241,0.18); border-color: rgba(99,102,241,0.35); color: #a5b4fc; }

.filter-date {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  color: #fff; border-radius: 10px; padding: 0.4rem 0.7rem; font-size: 0.82rem; outline: none;
}
.filter-date:focus { border-color: rgba(99,102,241,0.4); }

.results-badge {
  font-size: 0.78rem; color: var(--text-secondary); white-space: nowrap;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px; padding: 0.25rem 0.75rem;
}

/* Cards resumo */
.summary-card { border-radius: 16px; }
.summary-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); }
.summary-sub { font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px; display: block; }
.text-success-custom { color: #10b981; }
.text-danger-custom { color: var(--color-danger); }

/* Tabela */
.table-header { border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); }
.transactions-list { max-height: 600px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(99,102,241,0.3) transparent; }
.transactions-list::-webkit-scrollbar { width: 5px; }
.transactions-list::-webkit-scrollbar-thumb { background-color: rgba(99,102,241,0.3); border-radius: 99px; }

.transaction-item { border-bottom: 1px solid rgba(255,255,255,0.04); }
.transaction-item:last-child { border-bottom: none; }
.transaction-row { cursor: pointer; transition: background-color 0.15s ease; }
.tx-chevron { font-size: 0.65rem; color: var(--text-secondary); width: 1rem; text-align: center; }
.tx-details { background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.04); }
.detail-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary); }
.detail-value { font-size: 0.85rem; color: #fff; word-break: break-word; }
.transaction-row:hover { background: rgba(255,255,255,0.025); }

.tx-icon-wrapper { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.95rem; flex-shrink: 0; }
.tx-icon-wrapper.credit { background: rgba(16,185,129,0.12); color: #10b981; }
.tx-icon-wrapper.debit { background: rgba(244,63,94,0.1); color: var(--color-danger); }

.tx-description { font-size: 0.88rem; font-weight: 600; color: #e2e8f0; max-width: 280px; display: inline-block; }
.tx-category-badge { font-size: 0.7rem; font-weight: 600; background: rgba(99,102,241,0.12); color: #a5b4fc; border-radius: 6px; padding: 0.15rem 0.5rem; white-space: nowrap; }
.tx-meta { font-size: 0.76rem; color: var(--text-secondary); }
.tx-meta-dot { color: rgba(255,255,255,0.2); font-size: 0.76rem; }
.tx-date { font-size: 0.78rem; color: var(--text-secondary); white-space: nowrap; flex-shrink: 0; min-width: 90px; }
.tx-amount { font-size: 0.9rem; font-weight: 700; white-space: nowrap; flex-shrink: 0; min-width: 110px; }

/* Paginação */
.pagination-bar { border-top: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); }
.page-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: var(--text-secondary); border-radius: 10px; padding: 0.4rem 0.9rem; font-size: 0.83rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
.page-btn:hover:not(:disabled) { background: rgba(99,102,241,0.12); color: #a5b4fc; border-color: rgba(99,102,241,0.25); }
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* Estados */
.error-icon, .empty-icon { font-size: 2.5rem; display: flex; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 50%; background: rgba(255,255,255,0.04); }
.max-width-para { max-width: 400px; }
.min-width-0 { min-width: 0; }
</style>
