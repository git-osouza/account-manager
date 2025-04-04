<template>
  <div class="container">
    <div class="row">
      <div v-for="(info, month) in overdueAccounts" :key="month" class="col-md-6">
        <b-card class="text-white" :bg-variant="'danger'" header-class="fw-bold">
          <template #header>
            Contas em atraso - {{ month }}
          </template>
          <b-card-text>
            <h6>Total de Contas: {{ info.count }}</h6>
            <h6>Valor Total: {{ formattedValue(info.totalAmount) }}</h6>
          </b-card-text>
        </b-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useToast } from "vue-toastification";
import supabase from "@/utils/supabase";

export default {
  name: 'DashboardView',
  setup() {
    const toast = useToast();
    const overdueAccounts = ref({});

    onMounted(fetchOverdueAccounts);

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

    function formattedValue(value) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    }

    return {
      overdueAccounts,
      formattedValue
    };
  },
};
</script>

<style scoped>
h5 {
  margin-bottom: 0;
}
</style>
