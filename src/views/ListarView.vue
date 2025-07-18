<template>
  <div class="container">
    <div class="d-flex flex-column align-items-center mb-4 gap-2">
      <div class="input-group w-auto">
        <span class="input-group-text">💰 Salário</span>
        <input
          v-model="monthlySalary"
          type="number"
          class="form-control"
          placeholder="Informe o salário do mês"
        />
      </div>

      <div class="input-group w-auto">
        <span class="input-group-text">📄 Total de Contas</span>
        <input
          :value="totalAccounts"
          type="number"
          class="form-control"
          readonly
        />
      </div>

      <div class="input-group w-auto">
        <span class="input-group-text">💼 Valor Restante</span>
        <input
          :value="remainingBalance"
          type="number"
          class="form-control"
          readonly
        />
      </div>
    </div>

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
              {{ parcela.account.ds_nome }}
            </td>
            <td> {{ parcela.account.dia_vencimento }} </td>
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
    const monthlySalary = ref(9970)
    const totalAccounts = ref(0)


    const months = computed(() => {
      return [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
    });

    const selectedMonth = ref(null);

    const remainingBalance = computed(() => {
      const result = monthlySalary.value - totalAccounts.value;
      return result < 0 ? 0 : result.toFixed(2);
    });



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
            .from('account_parcelas')
            .select('*, account:id_account(*)')
            .eq('account.user_id', user.id)
            .gte('dt_vencimento', startOfMonth)
            .lte('dt_vencimento', endOfMonth)
            .order('dt_vencimento', { ascending: true });

          if (accountsError) {
            toast.error("Ocorreu um erro ao buscar as contas");
          }

          const result = accountsResult.map((conta) => {
              return {
                ...conta,
                status: conta.dt_pagamento ? "Pago" : validateStatus(conta.dt_vencimento)
              };
          });

          totalAccounts.value = Number(accountsResult.reduce((acc, item) => acc + item.valor_parcela, 0)).toFixed(2);
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

    function formattedDate(date) {
      return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
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
          recalcTotalAccounts();
        }
      }

      parcela[`isEditing${field.charAt(0).toUpperCase() + field.slice(1)}`] = false;
    }

    function validateStatus(dataVencimento){
      const dataAtual = new Date();
      const dataVencimentoFormatada = new Date(dataVencimento);
      if(dataVencimentoFormatada < dataAtual){
        return 'Atrasado';
      }
      return 'Pendente';
    }

    function recalcTotalAccounts() {
      totalAccounts.value = accounts.value
        .reduce((acc, item) => acc + Number(item.valor_parcela || 0), 0)
        .toFixed(2);
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
      saveEdit,
      formattedDate,
      monthlySalary,
      totalAccounts,
      remainingBalance,
      recalcTotalAccounts
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
