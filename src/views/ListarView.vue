<template>
  <div class="container">

    <h2 class="text-center mb-4">Minhas Contas</h2>

    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger text-center">{{ error }}</div>

    <div class="table-responsive">
      <table v-if="accounts.length > 0" class="table table-striped table-hover">
        <thead class="table-dark" style="font-size: small;">
          <tr>
            <th>Conta</th>
            <th>Valor</th>
            <th>Dia venc.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(conta) in accounts" :key="conta.id">
            <td>
              <button 
                class="btn btn-link text-primary fw-bold p-0" 
                style="text-decoration: none"
                @click="verDetalhes(conta.id)">
                {{ conta.ds_nome }}
              </button>
            </td>
            <td>R$ {{ conta.valor_total }}</td>
            <td class="text-center">
              {{ conta.dia_vencimento }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Detalhes -->
    <div v-if="selectedAccount" class="modal fade show d-block" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Detalhes da Conta</h5>
            <button type="button" class="btn-close" @click="fecharModal"></button>
          </div>
          <div class="modal-body">
            <div class="table-responsive">
              <table v-if="accounts.length > 0" class="table table-striped table-hover">
                <thead class="table-dark" style="font-size: small;">
                  <tr>
                    <th>Conta</th>
                    <th>Valor</th>
                    <th>Dia venc.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(conta) in accounts" :key="conta.id">
                    <td>
                      {{ conta.ds_nome }}
                    </td>
                    <td>R$ {{ conta.valor_total }}</td>
                    <td class="text-center">
                      {{ conta.dia_vencimento }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fundo escuro da modal -->
    <div v-if="selectedAccount" class="modal-backdrop fade show"></div>
  </div>
</template>



<script>
import { ref, onMounted } from 'vue';
import { useToast } from "vue-toastification";
import supabase from '@/utils/supabase';

export default {
  name: 'ListarView',
  setup() {
    const toast = useToast();
    const accounts = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const selectedAccount = ref(null);

    async function getAccountsByIdUserAutenticated() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (user) {
          const { data: accountsResult, error: accountsError } = await supabase
            .from('account')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (accountsError) {
            toast.error('Ocorreu um erro ao buscar as contas');
          }

          accounts.value = accountsResult;
        }
      } catch (err) {
        console.error('Erro ao buscar contas:', err.message);
        error.value = 'Ocorreu um erro ao buscar as contas';
        toast.error(error.value);
      } finally {
        loading.value = false;
      }
    }

    function verDetalhes(conta) {
      selectedAccount.value = conta;
    }

    function fecharModal() {
      selectedAccount.value = null;
    }

    onMounted(getAccountsByIdUserAutenticated);

    return {
      accounts,
      loading,
      error,
      verDetalhes,
      selectedAccount,
      fecharModal
    };
  }

};
</script>

<style scoped></style>