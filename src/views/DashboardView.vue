<template>
  <div class="dashboard-container">
    <div class="row mb-4">
      <div class="col-12">
        <div class="glass-card welcome-banner p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h2 class="text-start mb-1 text-gradient-bright fw-bold">
              Olá! Seja bem-vindo.
            </h2>
            <p class="text-secondary mb-0">
              Aqui está o resumo financeiro das suas contas em atraso.
            </p>
          </div>
          <div class="d-flex align-items-center gap-3">
            <div class="stat-bubble d-flex flex-column align-items-end">
              <span class="text-light opacity-75 small uppercase fw-semibold">Total em Atraso</span>
              <h3 class="fw-bold text-danger-custom mb-0">
                {{ formattedValue(totalOverdueAmount) }}
              </h3>
            </div>
            <div class="stat-bubble d-flex flex-column align-items-end border-left-bubble ps-3">
              <span class="text-light opacity-75 small uppercase fw-semibold">Contas Pendentes</span>
              <h3 class="fw-bold text-white mb-0">
                {{ totalOverdueCount }}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Se houver contas em atraso, lista por mês -->
    <div
      v-if="totalOverdueCount > 0"
      class="row g-4"
    >
      <div
        v-for="(info, month) in overdueAccounts"
        :key="month"
        class="col-md-6 col-lg-4"
      >
        <div
class="glass-card overdue-month-card clickable-month-card"
@click="navigateToListar(month)"
>
          <div class="card-glow-red" />
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div class="d-flex align-items-center gap-2">
              <div class="icon-wrapper bg-danger-glow">
                <svg
xmlns="http://www.w3.org/2000/svg"
width="20"
height="20"
fill="currentColor"
class="bi bi-calendar-x-fill text-danger-custom"
viewBox="0 0 16 16"
>
                  <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4zm12 5H0v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zM11.854 8.854 10.707 10l1.147 1.146a.5.5 0 0 1-.708.708L10 10.707l-1.146 1.147a.5.5 0 0 1-.708-.708L9.293 10 8.146 8.854a.5.5 0 1 1 .708-.708L10 9.293l1.146-1.147a.5.5 0 0 1 .708.708z" />
                </svg>
              </div>
              <h5 class="fw-bold mb-0 text-capitalize">
{{ month }}
</h5>
            </div>
            <span class="status-badge atrasado">{{ info.count }} {{ info.count === 1 ? 'conta' : 'contas' }}</span>
          </div>
          
          <div class="mt-4">
            <span class="text-secondary small d-block">VALOR TOTAL EM ATRASO</span>
            <h3 class="fw-bold mt-1 text-danger-custom">
{{ formattedValue(info.totalAmount) }}
</h3>
          </div>

          <div class="progress-bar-custom mt-3">
            <div
class="progress-fill-red"
style="width: 100%;"
/>
          </div>
        </div>
      </div>
    </div>

    <!-- Se não houver contas em atraso -->
    <div
v-else
class="row mt-4"
>
      <div class="col-12 text-center py-5">
        <div class="glass-card py-5">
          <div class="icon-wrapper-large mx-auto mb-3">
            <svg
xmlns="http://www.w3.org/2000/svg"
width="40"
height="40"
fill="currentColor"
class="bi bi-shield-check text-success"
viewBox="0 0 16 16"
>
              <path d="M5.338 1.59a6.1 6.1 0 0 0-2.837.856.48.48 0 0 0-.228.389v4c0 2.71 1.524 5.118 4 6 2.476-.882 4-3.29 4-6V2.835a.48.48 0 0 0-.228-.389 6.1 6.1 0 0 0-2.837-.856l-.68-.182a.5.5 0 0 0-.324 0zM8 0c.68 0 1.3.12 1.868.324l.68.182a1.5 1.5 0 0 1 1.02 1.258v4c0 3.715-2.22 7.027-5.568 8.228a1.5 1.5 0 0 1-1.024 0C2.22 12.827 0 9.515 0 5.8v-4a1.5 1.5 0 0 1 1.02-1.258l.68-.182A8 8 0 0 1 8 0" />
              <path d="M10.854 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 8.793l2.646-2.647a.5.5 0 0 1 .708 0" />
            </svg>
          </div>
          <h4 class="fw-bold text-white">
Tudo em dia!
</h4>
          <p class="text-secondary max-width-para mx-auto">
Você não possui nenhuma parcela em atraso no momento. Continue assim!
</p>
        </div>
      </div>
    </div>

    <!-- Gráfico de Orçamento 70/20/10 -->
    <div class="row mt-4">
      <div class="col-12">
        <BudgetPieChart />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onActivated, computed } from "vue";
import { useToast } from "vue-toastification";
import supabase from "@/utils/supabase";
import BudgetPieChart from "@/components/BudgetPieChart.vue";

export default {
  name: 'DashboardView',
  components: { BudgetPieChart },
  emits: ['change-view'],
  setup(props, { emit }) {
    const toast = useToast();
    const overdueAccounts = ref({});
    const isFirstMount = ref(true);

    onMounted(fetchOverdueAccounts);

    onActivated(() => {
      if (isFirstMount.value) {
        isFirstMount.value = false;
        return;
      }
      fetchOverdueAccounts();
    });

    async function fetchOverdueAccounts() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) return;

        const today = new Date().toISOString();

        const { data: accountsResult, error: accountsError } = await supabase
          .from("account_parcelas")
          .select("dt_vencimento, valor_parcela")
          .lt("dt_vencimento", today)
          .is("dt_pagamento", null)
          .order("dt_vencimento", { ascending: false });

        if (accountsError) {
          toast.error("Erro ao buscar contas em atraso");
          return;
        }

        const grouped = {};
        accountsResult.forEach((parcela) => {
          const date = new Date(parcela.dt_vencimento);
          const monthYear = `${date.toLocaleString("pt-BR", { month: "long" })} ${date.getFullYear()}`;

          if (!grouped[monthYear]) {
            grouped[monthYear] = { count: 0, totalAmount: 0 };
          }

          grouped[monthYear].count += 1;
          grouped[monthYear].totalAmount += parcela.valor_parcela;
        });

        overdueAccounts.value = grouped;
      } catch (err) {
        console.error("Erro ao buscar contas:", err.message);
        toast.error("Erro ao carregar dados do dashboard.");
      }
    }

    const totalOverdueAmount = computed(() => {
      return Object.values(overdueAccounts.value).reduce((sum, item) => sum + item.totalAmount, 0);
    });

    const totalOverdueCount = computed(() => {
      return Object.values(overdueAccounts.value).reduce((sum, item) => sum + item.count, 0);
    });

    function formattedValue(value) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    }

    function navigateToListar(monthYearString) {
      const parts = monthYearString.split(' ');
      if (parts.length === 2) {
        const monthName = parts[0].toLowerCase();
        const year = parseInt(parts[1], 10);

        const monthNames = [
          "janeiro", "fevereiro", "março", "abril", "maio", "junho",
          "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
        ];
        const monthIndex = monthNames.indexOf(monthName);

        if (monthIndex !== -1 && !isNaN(year)) {
          emit('change-view', 'Listar', { month: monthIndex, year: year });
        }
      }
    }

    return {
      overdueAccounts,
      formattedValue,
      totalOverdueAmount,
      totalOverdueCount,
      navigateToListar
    };
  },
};
</script>

<style scoped>
.dashboard-container {
  width: 100%;
}

.welcome-banner {
  border-left: 4px solid var(--color-danger);
}

.text-gradient-bright {
  background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.clickable-month-card {
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.clickable-month-card:hover {
  transform: translateY(-4px) scale(1.01);
  border-color: rgba(99, 102, 241, 0.3) !important;
  box-shadow: 0 12px 24px rgba(99, 102, 241, 0.15) !important;
}

.stat-bubble {
  min-width: 120px;
}
.border-left-bubble {
  border-left: 1px solid rgba(255, 255, 255, 0.12);
}

.uppercase {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.text-danger-custom {
  color: var(--color-danger);
}

.overdue-month-card {
  position: relative;
  overflow: hidden;
}

.card-glow-red {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
}
.bg-danger-glow {
  background-color: var(--color-danger-bg);
}

.icon-wrapper-large {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.progress-bar-custom {
  width: 100%;
  height: 6px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
}
.progress-fill-red {
  height: 100%;
  background: linear-gradient(90deg, var(--color-danger) 0%, #ff7b93 100%);
  border-radius: 10px;
}

.max-width-para {
  max-width: 400px;
}
</style>

