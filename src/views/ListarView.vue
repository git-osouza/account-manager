<template>
  <div class="list-container">
    <!-- Painel de Orçamento Premium -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="glass-card budget-widget d-flex align-items-center justify-content-between p-3 h-100">
          <div>
            <span class="text-light opacity-75 small uppercase fw-semibold">Salário Mensal</span>
            <div class="d-flex align-items-center gap-1 mt-1">
              <span class="currency-symbol text-secondary font-monospace">R$</span>
              <input
                v-model="monthlySalary"
                type="number"
                class="salary-input-inline"
                placeholder="0,00"
              >
            </div>
          </div>
          <div class="widget-icon bg-indigo-glow">
            💰
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="glass-card budget-widget d-flex align-items-center justify-content-between p-3 h-100">
          <div>
            <span class="text-light opacity-75 small uppercase fw-semibold">Total de Contas</span>
            <h3 class="fw-bold mt-1 mb-0 text-white font-monospace">
{{ formattedValue(totalAccounts) }}
</h3>
          </div>
          <div class="widget-icon bg-rose-glow">
            📄
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="glass-card budget-widget d-flex align-items-center justify-content-between p-3 h-100">
          <div>
            <span class="text-light opacity-75 small uppercase fw-semibold">Saldo Restante</span>
            <h3 :class="['fw-bold mt-1 mb-0 font-monospace', remainingBalance < 0 ? 'text-danger-custom' : 'text-success-custom']">
              {{ formattedValue(remainingBalance) }}
            </h3>
            <div
v-if="previousMonthBalance > 0"
class="text-success-custom mt-1 small fw-semibold"
style="font-size: 0.75rem;"
>
              + {{ formattedValue(previousMonthBalance) }} do mês anterior
            </div>
          </div>
          <div class="widget-icon bg-emerald-glow">
            💼
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros de Mês/Ano -->
    <div class="glass-card filter-bar py-3 px-4 mb-4">
      <div class="d-flex flex-wrap align-items-center gap-3">
        <span class="text-secondary fw-semibold">Filtrar Período:</span>
        <div class="d-flex gap-2 flex-grow-1 flex-md-grow-0">
          <!-- SELECT DO ANO -->
          <select 
            v-model="selectedYear"
            class="form-select custom-select-premium"
            aria-label="Selecione o ano"
            @change="fetchAccounts"
          >
            <option
value=""
disabled
>
Ano
</option>
            <option
v-for="year in years"
:key="year"
:value="year"
>
              {{ year }}
            </option>
          </select>

          <!-- SELECT DO MÊS -->
          <select 
            v-model="selectedMonth"
            class="form-select custom-select-premium"
            aria-label="Selecione o mês"
            :disabled="!selectedYear"
            @change="() => { fetchAccounts(); setMonthlySalaryToMonth(selectedMonth) }"
          >
            <option
value=""
disabled
>
Mês
</option>
            <option 
              v-for="(month, index) in months" 
              :key="index" 
              :value="index"
            >
              {{ month }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div
v-if="error"
class="alert alert-danger text-center bg-danger-glow border-0 text-white mb-4"
>
{{ error }}
</div>

    <!-- Tabela de Contas -->
    <div class="table-responsive glass-table-container d-none d-md-block">
      <table
v-if="accounts.length > 0"
class="table table-hover align-middle"
>
        <thead>
          <tr>
            <th>Conta</th>
            <th class="text-center">
Dia Venc.
</th>
            <th class="text-center">
Nº Parcela
</th>
            <th>Valor Parcela</th>
            <th>Data Vencimento</th>
            <th>Data Pagamento</th>
            <th>Status</th>
            <th class="text-center">
Ações
</th>
          </tr>
        </thead>
        <tbody>
          <tr
v-for="parcela in accounts"
:key="parcela.id"
>
            <td class="fw-semibold text-white">
              {{ parcela.account ? parcela.account.ds_nome : 'Carregando...' }}
            </td>
            
            <td class="text-center font-monospace">
              {{ parcela.account ? parcela.account.dia_vencimento : '-' }}
            </td>
            
            <td class="text-center font-monospace text-secondary">
              {{ parcela.numero_parcela }}
            </td>

            <td>
              <div
v-if="parcela.isEditingValor_parcela"
class="edit-cell-input-wrapper"
>
                <input 
                  v-model="parcelasEditValues[parcela.id + '-valor_parcela']"
                  type="number" 
                  step="0.01"
                  class="form-control form-control-sm table-edit-input" 
                  @blur="saveEdit(parcela, 'valor_parcela')"
                  @keyup.enter="saveEdit(parcela, 'valor_parcela')" 
                >
              </div>
              <span
v-else
class="editable-cell font-monospace"
@click="edit(parcela, 'valor_parcela')"
>
                {{ formattedValue(parcela.valor_parcela) }}
              </span>
            </td>

            <td>
              <div
v-if="parcela.isEditingDt_vencimento"
class="edit-cell-input-wrapper"
>
                <input 
                  v-model="parcelasEditValues[parcela.id + '-dt_vencimento']"
                  type="date" 
                  class="form-control form-control-sm table-edit-input"
                  @blur="saveEdit(parcela, 'dt_vencimento')" 
                  @keyup.enter="saveEdit(parcela, 'dt_vencimento')" 
                >
              </div>
              <span
v-else
class="editable-cell font-monospace text-secondary"
@click="edit(parcela, 'dt_vencimento')"
>
                {{ parcela.dt_vencimento }}
              </span>
            </td>

            <td>
              <div
v-if="parcela.isEditingDt_pagamento"
class="edit-cell-input-wrapper"
>
                <input 
                  v-model="parcelasEditValues[parcela.id + '-dt_pagamento']"
                  type="date" 
                  class="form-control form-control-sm table-edit-input"
                  @blur="saveEdit(parcela, 'dt_pagamento')" 
                  @keyup.enter="saveEdit(parcela, 'dt_pagamento')" 
                >
              </div>
              <span
v-else
class="editable-cell font-monospace"
@click="edit(parcela, 'dt_pagamento')"
>
                {{ parcela.dt_pagamento !== null ? parcela.dt_pagamento : 'Não pago' }}
              </span>
            </td>

            <td>
              <div
v-if="parcela.isEditingStatus"
class="edit-cell-input-wrapper"
>
                <select 
                  v-model="parcelasEditValues[parcela.id + '-status']" 
                  class="form-select form-select-sm table-edit-input"
                  @blur="saveEdit(parcela, 'status')"
                  @change="saveEdit(parcela, 'status')"
                >
                  <option value="Pendente">
Pendente
</option>
                  <option value="Pago">
Pago
</option>
                  <option value="Atrasado">
Atrasado
</option>
                </select>
              </div>
              <span
v-else
:class="['status-badge editable-cell-badge', getStatusClass(parcela.status)]"
@click="edit(parcela, 'status')"
>
                {{ parcela.status }}
              </span>
            </td>

            <td class="text-center">
              <button
class="btn btn-link delete-action-btn p-1"
title="Deletar Parcela"
@click="deletarParcela(parcela.id)"
>
                <svg
xmlns="http://www.w3.org/2000/svg"
width="16"
height="16"
fill="currentColor"
class="bi bi-trash3-fill"
viewBox="0 0 16 16"
>
                  <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-else
        class="text-center py-5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          fill="currentColor"
          class="bi bi-folder-x text-muted mb-3"
          viewBox="0 0 16 16"
        >
          <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181L15.546 8H14.54l.269-2.961A1 1 0 0 0 13.81 4H9.828a3 3 0 0 1-2.12-.879l-.83-.828A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139zm13.7 5.69a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1 0-1h3.793l-5.646-5.646a.5.5 0 0 1 .708-.708L13.7 13.793V10a.5.5 0 0 1 .5-.5" />
        </svg>
        <p class="text-secondary mb-0">
          Nenhuma conta encontrada para o mês e ano selecionados.
        </p>
      </div>
    </div>

    <!-- Lista de Contas (Mobile Card List) -->
    <div class="mobile-list-container d-block d-md-none mt-4">
      <div v-if="accounts.length > 0">
        <div
v-for="parcela in accounts"
:key="parcela.id"
class="glass-card mobile-account-card mb-3 p-3"
>
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h5 class="fw-bold text-white mb-1">
{{ parcela.account ? parcela.account.ds_nome : 'Carregando...' }}
</h5>
              <span class="text-secondary small font-monospace">Parcela {{ parcela.numero_parcela }}</span>
            </div>
            <!-- Status Badge (Editável onClick) -->
            <div
v-if="parcela.isEditingStatus"
class="edit-cell-input-wrapper"
>
              <select 
                v-model="parcelasEditValues[parcela.id + '-status']" 
                class="form-select form-select-sm table-edit-input"
                @blur="saveEdit(parcela, 'status')"
                @change="saveEdit(parcela, 'status')"
              >
                <option value="Pendente">
Pendente
</option>
                <option value="Pago">
Pago
</option>
                <option value="Atrasado">
Atrasado
</option>
              </select>
            </div>
            <span
v-else
:class="['status-badge editable-cell-badge', getStatusClass(parcela.status)]"
@click="edit(parcela, 'status')"
>
              {{ parcela.status }}
            </span>
          </div>

          <div class="row g-2 mt-2 pt-2 border-top-mobile">
            <div class="col-6">
              <span class="text-muted small d-block mb-1">VALOR</span>
              <div
v-if="parcela.isEditingValor_parcela"
class="edit-cell-input-wrapper"
>
                <input 
                  v-model="parcelasEditValues[parcela.id + '-valor_parcela']"
                  type="number" 
                  step="0.01"
                  class="form-control form-control-sm table-edit-input" 
                  @blur="saveEdit(parcela, 'valor_parcela')"
                  @keyup.enter="saveEdit(parcela, 'valor_parcela')" 
                >
              </div>
              <span
v-else
class="editable-cell font-monospace text-white fw-bold"
@click="edit(parcela, 'valor_parcela')"
>
                {{ formattedValue(parcela.valor_parcela) }}
              </span>
            </div>

            <div class="col-6">
              <span class="text-muted small d-block mb-1">DIA VENC.</span>
              <span class="font-monospace text-white">{{ parcela.account ? parcela.account.dia_vencimento : '-' }}</span>
            </div>

            <div class="col-6">
              <span class="text-muted small d-block mb-1">VENCIMENTO</span>
              <div
v-if="parcela.isEditingDt_vencimento"
class="edit-cell-input-wrapper"
>
                <input 
                  v-model="parcelasEditValues[parcela.id + '-dt_vencimento']"
                  type="date" 
                  class="form-control form-control-sm table-edit-input"
                  @blur="saveEdit(parcela, 'dt_vencimento')" 
                  @keyup.enter="saveEdit(parcela, 'dt_vencimento')" 
                >
              </div>
              <span
v-else
class="editable-cell font-monospace text-secondary"
@click="edit(parcela, 'dt_vencimento')"
>
                {{ parcela.dt_vencimento }}
              </span>
            </div>

            <div class="col-6">
              <span class="text-muted small d-block mb-1">PAGAMENTO</span>
              <div
v-if="parcela.isEditingDt_pagamento"
class="edit-cell-input-wrapper"
>
                <input 
                  v-model="parcelasEditValues[parcela.id + '-dt_pagamento']"
                  type="date" 
                  class="form-control form-control-sm table-edit-input"
                  @blur="saveEdit(parcela, 'dt_pagamento')" 
                  @keyup.enter="saveEdit(parcela, 'dt_pagamento')" 
                >
              </div>
              <span
v-else
class="editable-cell font-monospace text-white"
@click="edit(parcela, 'dt_pagamento')"
>
                {{ parcela.dt_pagamento !== null ? parcela.dt_pagamento : 'Não pago' }}
              </span>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top-mobile">
            <button 
              v-if="parcela.status !== 'Pago'" 
              class="btn btn-sm btn-success-custom px-3 py-1 d-flex align-items-center gap-2"
              @click="markAsPaidQuick(parcela)"
            >
              ✓ Pagar
            </button>
            <div v-else />

            <button
class="btn btn-sm delete-action-btn d-flex align-items-center gap-1"
@click="deletarParcela(parcela.id)"
>
              <svg
xmlns="http://www.w3.org/2000/svg"
width="14"
height="14"
fill="currentColor"
class="bi bi-trash3-fill"
viewBox="0 0 16 16"
>
                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5M5 5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-1 0m3 0v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-1 0m3 0v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-1 0" />
              </svg>
              <span>Excluir</span>
            </button>
          </div>
        </div>
      </div>
      <div
v-else
class="text-center py-5"
>
        <svg
xmlns="http://www.w3.org/2000/svg"
width="48"
height="48"
fill="currentColor"
class="bi bi-folder-x text-muted mb-3"
viewBox="0 0 16 16"
>
          <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181L15.546 8H14.54l.269-2.961A1 1 0 0 0 13.81 4H9.828a3 3 0 0 1-2.12-.879l-.83-.828A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139zm13.7 5.69a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1 0-1h3.793l-5.646-5.646a.5.5 0 0 1 .708-.708L13.7 13.793V10a.5.5 0 0 1 .5-.5" />
        </svg>
        <p class="text-secondary mb-0">
Nenhuma conta encontrada para o mês e ano selecionados.
</p>
      </div>
    </div>
  </div>
</template>

<script>
import supabase from "@/utils/supabase";
import { computed, ref, watch, reactive, onMounted, onActivated } from "vue";
import { useToast } from "vue-toastification";

export default {
  name: "ListarView",
  props: {
    filterParams: { type: Object, default: null }
  },
  emits: ['clear-filter-params'],
  setup(props, { emit }) {
    const toast = useToast();
    const loading = ref(true);
    const error = ref(null);
    const accounts = ref([]);
    const isFirstMount = ref(true);
    const monthlySalary = ref(0);
    const previousMonthBalance = ref(0);
    const totalAccounts = ref(0);
    const selectedYear = ref(new Date().getFullYear());
    const selectedMonth = ref(new Date().getMonth());
    const parcelasEditValues = reactive({});

    const years = computed(() => {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 5 }, (_, i) => currentYear + i); 
    });

    const months = computed(() => {
      return [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
    });

    const remainingBalance = computed(() => {
      return Number((monthlySalary.value + previousMonthBalance.value - totalAccounts.value).toFixed(2));
    });

    watch(selectedMonth, (newMonth) => {
      if (newMonth !== null) {
        const savedSalary = localStorage.getItem(`monthlySalary-${newMonth}`);
        monthlySalary.value = savedSalary ? JSON.parse(savedSalary) : 0;
      }
    });

    watch(monthlySalary, (newSalary) => {
      if (selectedMonth.value !== null) {
        localStorage.setItem(`monthlySalary-${selectedMonth.value}`, JSON.stringify(newSalary));
      }
    });

    async function fetchAccounts() {
      if (selectedMonth.value === null || !selectedYear.value) return;
      loading.value = true;
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          const startOfMonth = new Date(selectedYear.value, selectedMonth.value, 1).toISOString();
          const endOfMonth = new Date(selectedYear.value, selectedMonth.value + 1, 0).toISOString();

          const { data: accountsResult, error: accountsError } = await supabase
            .from('account_parcelas')
            .select('*, account:id_account(*)')
            .eq('account.user_id', user.id)
            .gte('dt_vencimento', startOfMonth)
            .lte('dt_vencimento', endOfMonth)
            .order('dt_vencimento', { ascending: true });

          if (accountsError) throw accountsError;

          const result = accountsResult.map((conta) => ({
            ...conta,
            status: conta.dt_pagamento ? "Pago" : validateStatus(conta.dt_vencimento),
            isEditingValor_parcela: false,
            isEditingDt_vencimento: false,
            isEditingDt_pagamento: false,
            isEditingStatus: false
          }));

          recalcTotalAccounts(result);
          accounts.value = result;
          await fetchPreviousMonthBalance();
        }
      } catch (err) {
        console.error("Erro ao buscar contas:", err.message);
        error.value = "Ocorreu um erro ao buscar as contas";
        toast.error(error.value);
      } finally {
        loading.value = false;
      }
    }

    async function fetchPreviousMonthBalance() {
      if (selectedMonth.value === null || !selectedYear.value) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let prevMonth = selectedMonth.value - 1;
        let prevYear = selectedYear.value;
        if (prevMonth < 0) {
          prevMonth = 11;
          prevYear -= 1;
        }

        const savedSalary = localStorage.getItem(`monthlySalary-${prevMonth}`);
        const prevSalary = savedSalary ? JSON.parse(savedSalary) : 0;
        
        if (prevSalary <= 0) {
          previousMonthBalance.value = 0;
          return;
        }

        const startOfMonth = new Date(prevYear, prevMonth, 1).toISOString();
        const endOfMonth = new Date(prevYear, prevMonth + 1, 0).toISOString();

        const { data: accountsResult, error: accountsError } = await supabase
          .from('account_parcelas')
          .select('*, account:id_account(*)')
          .eq('account.user_id', user.id)
          .gte('dt_vencimento', startOfMonth)
          .lte('dt_vencimento', endOfMonth);

        if (accountsError) throw accountsError;

        const prevTotalAccounts = accountsResult
          .filter((item) => (item.dt_pagamento ? "Pago" : validateStatus(item.dt_vencimento)) !== 'Pago')
          .reduce((acc, item) => acc + Number(item.valor_parcela || 0), 0);

        const balance = prevSalary - prevTotalAccounts;
        previousMonthBalance.value = balance > 0 ? balance : 0;
      } catch (err) {
        console.error("Erro ao buscar saldo anterior:", err);
        previousMonthBalance.value = 0;
      }
    }

    async function deletarParcela(parcelaId) {
      if (!confirm("Deseja realmente deletar esta parcela?")) return;
      const { error: deleteError } = await supabase
        .from('account_parcelas')
        .delete()
        .eq('id', parcelaId);

      if (deleteError) {
        toast.error('Ocorreu um erro ao deletar a parcela');
      } else {
        toast.success('Parcela deletada com sucesso!');
        fetchAccounts();
      }
    }

    function formattedValue(value) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    }

    function edit(parcela, field) {
      parcela[`isEditing${field.charAt(0).toUpperCase() + field.slice(1)}`] = true;
      parcelasEditValues[`${parcela.id}-${field}`] = parcela[field];
    }

    async function saveEdit(parcela, field) {
      const originalValue = parcela[field];
      const newValue = parcelasEditValues[`${parcela.id}-${field}`];

      if (newValue === undefined || originalValue === newValue) {
        parcela[`isEditing${field.charAt(0).toUpperCase() + field.slice(1)}`] = false;
        return;
      }

      const updateData = { [field]: newValue };
      if (field === 'status' && newValue === 'Pago' && originalValue !== 'Pago') {
        const today = new Date().toISOString().split('T')[0];
        parcela.dt_pagamento = today;
        updateData.dt_pagamento = today;
        monthlySalary.value = Number((monthlySalary.value - parcela.valor_parcela).toFixed(2));
      }

      const { error } = await supabase
        .from('account_parcelas')
        .update(updateData)
        .eq('id', parcela.id);

      if (error) {
        toast.error("Ocorreu um erro ao salvar a alteração");
      } else {
        toast.success("Alteração salva com sucesso!");
        parcela[field] = newValue;
        recalcTotalAccounts();
      }
      parcela[`isEditing${field.charAt(0).toUpperCase() + field.slice(1)}`] = false;
    }

    function validateStatus(dataVencimento) {
      const dataAtual = new Date();
      dataAtual.setHours(0, 0, 0, 0);
      const dataVencimentoFormatada = new Date(dataVencimento);
      dataVencimentoFormatada.setHours(0, 0, 0, 0);
      return dataVencimentoFormatada < dataAtual ? 'Atrasado' : 'Pendente';
    }

    function recalcTotalAccounts(data = accounts.value) {
      totalAccounts.value = data
        .filter((item) => item.status !== 'Pago')
        .reduce((acc, item) => acc + Number(item.valor_parcela || 0), 0)
        .toFixed(2);
    }

    function setMonthlySalaryToMonth(index) {
      const savedSalary = localStorage.getItem(`monthlySalary-${index}`);
      monthlySalary.value = savedSalary ? JSON.parse(savedSalary) : 0;
    }

    function getStatusClass(status) {
      if (status === 'Pago') return 'text-success';
      if (status === 'Atrasado') return 'text-danger';
      return 'text-warning';
    }

    onMounted(() => {
      if (props.filterParams) {
        applyFilterParams();
      } else {
        setMonthlySalaryToMonth(selectedMonth.value);
        fetchAccounts();
      }
    });

    onActivated(() => {
      if (isFirstMount.value) {
        isFirstMount.value = false;
        return;
      }
      if (!props.filterParams) {
        fetchAccounts();
      }
    });

    watch(() => props.filterParams, (newVal) => {
      if (newVal) {
        applyFilterParams();
      }
    });

    function applyFilterParams() {
      if (props.filterParams) {
        selectedYear.value = props.filterParams.year;
        selectedMonth.value = props.filterParams.month;
        const savedSalary = localStorage.getItem(`monthlySalary-${props.filterParams.month}`);
        monthlySalary.value = savedSalary ? JSON.parse(savedSalary) : 0;
        fetchAccounts();
        emit('clear-filter-params');
      }
    }

    async function markAsPaidQuick(parcela) {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('account_parcelas')
        .update({
          status: 'Pago',
          dt_pagamento: today
        })
        .eq('id', parcela.id);

      if (error) {
        toast.error("Ocorreu um erro ao registrar pagamento");
      } else {
        toast.success("Pago com sucesso!");
        parcela.status = 'Pago';
        parcela.dt_pagamento = today;
        monthlySalary.value = Number((monthlySalary.value - parcela.valor_parcela).toFixed(2));
        recalcTotalAccounts();
      }
    }

    return {
      accounts, months, selectedMonth, loading, error, formattedValue,
      fetchAccounts, deletarParcela, edit, saveEdit, monthlySalary,
      previousMonthBalance, totalAccounts, remainingBalance, recalcTotalAccounts,
      setMonthlySalaryToMonth, years, selectedYear, parcelasEditValues,
      getStatusClass, markAsPaidQuick
    };
  },
};
</script>

<style scoped>
.list-container { width: 100%; }
.budget-widget { border-radius: 16px; position: relative; overflow: hidden; background: rgba(30, 41, 59, 0.5); }
.uppercase { text-transform: uppercase; letter-spacing: 0.05em; }
.salary-input-inline { background: transparent; border: none; color: #fff; font-size: 1.5rem; font-weight: 700; width: 100%; max-width: 140px; outline: none; padding: 0; }
.widget-icon { display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; border-radius: 12px; font-size: 1.5rem; }
.bg-indigo-glow { background-color: rgba(99, 102, 241, 0.12); }
.bg-rose-glow { background-color: rgba(244, 63, 94, 0.12); }
.bg-emerald-glow { background-color: rgba(16, 185, 129, 0.12); }
.text-success-custom { color: #10b981; }
.text-danger-custom { color: #f43f5e; }
.filter-bar { border-radius: 16px; background: rgba(17, 24, 39, 0.4); }
.custom-select-premium { height: 42px !important; font-size: 0.9rem !important; border-radius: 8px !important; }
.glass-table-container { border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
.editable-cell { cursor: pointer; border-bottom: 1px dashed rgba(255,255,255,0.2); }
.edit-cell-input-wrapper { max-width: 130px; }
.table-edit-input { height: 32px !important; padding: 2px 6px !important; font-size: 0.85rem !important; border-radius: 6px !important; }
.delete-action-btn { color: #94a3b8; border: none; background: transparent; transition: all 0.2s ease; }
.delete-action-btn:hover { color: #f43f5e; transform: scale(1.1); }

/* Mobile list styles */
.border-top-mobile { border-top: 1px solid rgba(255, 255, 255, 0.05); }
.btn-success-custom { background-color: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; transition: all 0.2s ease; }
.btn-success-custom:hover { background-color: rgba(16, 185, 129, 0.4); color: #fff; }
.mobile-account-card { padding: 1.25rem; transition: transform 0.2s ease; border: 1px solid rgba(255,255,255,0.05); }
.mobile-account-card:hover { border-color: rgba(255,255,255,0.1); }
</style>
