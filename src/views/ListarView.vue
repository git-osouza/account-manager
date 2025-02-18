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
            <th>Data pagamento</th>
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
            <td>{{ parcela.numero_parcela }}</td>

            <td>
              <input v-if="parcela.isEditingValor_parcela" v-model="parcela.valor_parcela"
                @blur="saveEdit(parcela, 'valor_parcela')" type="number" class="form-control" />
              <span v-else @click="edit(parcela, 'valor_parcela')" class="text-link">{{
                formattedValue(parcela.valor_parcela) }}</span>
            </td>

            <td>
              <input v-if="parcela.isEditingDt_vencimento" v-model="parcela.dt_vencimento"
                @blur="saveEdit(parcela, 'dt_vencimento')" type="date" class="form-control" />
              <span v-else @click="edit(parcela, 'dt_vencimento')" class="text-link">{{ parcela.dt_vencimento }}</span>
            </td>

            <td>
              <input v-if="parcela.isEditingDt_pagamento" v-model="parcela.dt_pagamento"
                @blur="saveEdit(parcela, 'dt_pagamento')" type="date" class="form-control" />
              <span v-else @click="edit(parcela, 'dt_pagamento')" class="text-link">
                {{ parcela.dt_pagamento !== null ? parcela.dt_pagamento : 0 }}
              </span>
            </td>

            <td>
              <select v-if="parcela.isEditingStatus" v-model="parcela.status" @blur="saveEdit(parcela, 'status')" class="form-select">
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
                <option value="Atrasado">Atrasado</option>
              </select>
              <span v-else @click="edit(parcela, 'status')" class="text-link">{{ parcela.status }}</span>
            </td>

            <td>
              <button class="btn btn-link text-dark fw-bold p-0" style="text-decoration: none"
                @click="deletarParcela(parcela.id)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                  class="bi bi-trash-fill" viewBox="0 0 16 16">
                  <path
                    d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="text-center mt-3">Nenhuma conta encontrada para este mês.</p>
    </div>

  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useToast } from "vue-toastification";
import supabase from "@/utils/supabase";

export default {
  name: "ListarView",
  components: {
  },
  setup() {
    const toast = useToast();
    const loading = ref(true);
    const error = ref(null);
    const accounts = ref([]);

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
                dt_pagamento: null,
                status: "Sem parcelas",
              }];
            }
          }).flat();

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

    async function deletarParcela(parcela) {
      const accountsParcelas = await supabase
        .from('account_parcelas')
        .delete()
        .eq('id', parcela);

      if (accountsParcelas.error) {
        toast.error('Ocorreu um erro ao buscar as contas parcelas');
      }

      fetchAccounts();
    }

    function formattedValue(value) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    }

    function edit(parcela, field) {
      parcela[`isEditing${field.charAt(0).toUpperCase() + field.slice(1)}`] = true;
      parcela[`original${field.charAt(0).toUpperCase() + field.slice(1)}`] = parcela[field];
    }

    async function saveEdit(parcela, field) {
      const originalValue = parcela[`original${field.charAt(0).toUpperCase() + field.slice(1)}`];
      const newValue = parcela[field];

      if (originalValue !== newValue) {
        const { error } = await supabase
          .from('account_parcelas')
          .update({ [field]: newValue })
          .eq('id', parcela.id);

        if (error) {
          toast.error("Ocorreu um erro ao salvar a alteração");
        } else {
          toast.success("Alteração salva com sucesso!");
        }
      }

      parcela[`isEditing${field.charAt(0).toUpperCase() + field.slice(1)}`] = false;
    }


    return {
      accounts,
      months,
      selectedMonth,
      loading,
      error,
      formattedValue,
      fetchAccounts,
      deletarParcela,
      edit,
      saveEdit
    };
  },
};
</script>

<style scoped>
.text-link {
  color: #007bff;
  cursor: pointer;
  text-decoration: node;
}

.text-link:hover {
  color: #0056b3;
}
</style>
