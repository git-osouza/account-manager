<template>
  <div class="container">
    <h2 class="text-center mb-4">Minhas Contas</h2>

    <div class="d-flex justify-content-center mb-3">
      <select v-model="selectedMonth" @change="fetchAccounts" class="form-select" aria-label="Selecione o mês">
        <option value="" disabled>Selecione o mês</option>
        <option v-for="(month, index) in months" :key="index" :value="index">
          {{ month }}
        </option>
      </select>
    </div>

    <div v-if="error" class="alert alert-danger text-center">{{ error }}</div>

    <div class="table-responsive">
      <table v-if="accounts.length > 0" class="table table-striped table-hover">
        <thead class="table-dark" style="font-size: small;">
          <tr>
            <th>Conta</th>
            <th>Valor total</th>
            <th>Dia venc.</th>
            <th>Nº parcela</th>
            <th>Valor parcela</th>
            <th>Data vencimento</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="parcela in accounts" :key="parcela.id">
            <td>
              {{ parcela.ds_nome }}
            </td>
            <td> {{ formattedValue(parcela.valor_total) }}</td>
            <td> {{ parcela.dia_vencimento }} </td>
            <td> {{ parcela.numero_parcela }}</td>
            <td> {{ formattedValue(parcela.valor_parcela) }}</td>
            <td> {{ parcela.dt_vencimento }}</td>
            <td> {{ parcela.status }}</td>
            <td>
              <button class="btn btn-link text-dark fw-bold p-0" style="text-decoration: none"
                @click="verDetalhes(parcela.id)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                  class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                  <path
                    d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="text-center mt-3">Nenhuma conta encontrada para este mês.</p>
    </div>

    <AccountDetalheModalComponent v-if="isModalVisible" :show="isModalVisible" :accountsDetail="accountsDetail"
    @close="fecharModal" size="xl" />

  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useToast } from "vue-toastification";
import supabase from "@/utils/supabase";
import AccountDetalheModalComponent from '@/components/AccountDetalheModalComponent.vue';

export default {
  name: "ListarView",
  components: {
    AccountDetalheModalComponent
  },
  setup() {
    const toast = useToast();
    const loading = ref(true);
    const error = ref(null);
    const accounts = ref([]);
    const accountsDetail = ref([]);
    const isModalVisible = ref(false);

    const months = computed(() => {
      return [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
    });

    const selectedMonth = ref(null);

    async function fetchAccounts() {
      if (selectedMonth.value === null) return;

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          const selectedYear = new Date().getFullYear();
          const startOfMonth = new Date(selectedYear, selectedMonth.value, 1).toISOString();
          const endOfMonth = new Date(selectedYear, selectedMonth.value + 1, 0).toISOString();

          const { data: accountsResult, error: accountsError } = await supabase
            .from("account")
            .select("*, account_parcelas(*)")
            .eq("user_id", user.id)
            .gte("account_parcelas.dt_vencimento", startOfMonth)
            .lte("account_parcelas.dt_vencimento", endOfMonth)
            .order("created_at", { ascending: false });

          if (accountsError) {
            toast.error("Ocorreu um erro ao buscar as contas");
          }

          const result = accountsResult.map((conta) => {
            if (conta.account_parcelas && conta.account_parcelas.length > 0) {
              return conta.account_parcelas.map((parcela) => ({
                ...parcela,
                id_account: conta.id,
                ds_nome: conta.ds_nome,
                valor_total: conta.valor_total,
                dia_vencimento: conta.dia_vencimento,
              }));
            } else {
              return [{
                id: conta.id,
                ds_nome: conta.ds_nome,
                valor_total: conta.valor_total,
                dia_vencimento: conta.dia_vencimento,
                numero_parcela: null,
                valor_parcela: null,
                dt_vencimento: null,
                status: "Sem parcelas",
              }];
            }
          }).flat();

          console.log(result);

          accounts.value = result;
        }
      } catch (err) {
        console.error("Erro ao buscar contas:", err.message);
        error.value = "Ocorreu um erro ao buscar as contas";
        toast.error(error.value);
      } finally {
        loading.value = false;
      }
    }


    async function verDetalhes(conta) {
      console.log(conta)

      const accountsParcelas = await supabase
        .from('account_parcelas')
        .select('*')
        .eq('id_account', conta)
        .order('created_at', { ascending: false });

      if (accountsParcelas.error) {
        toast.error('Ocorreu um erro ao buscar as contas parcelas');
      }

      accountsDetail.value = accountsParcelas.data;
      isModalVisible.value = true;
    }

    function fecharModal() {
      isModalVisible.value = false;
    }

    function formattedValue(value) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    }

    const filteredAccounts = computed(() => {
      return accounts.value;
    });

    return {
      accounts,
      accountsDetail,
      months,
      selectedMonth,
      loading,
      error,
      isModalVisible,
      fecharModal,
      formattedValue,
      filteredAccounts,
      fetchAccounts,
      verDetalhes
    };
  },
};
</script>

<style scoped></style>