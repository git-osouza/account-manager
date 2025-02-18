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
              <button class="btn btn-link text-primary fw-bold p-0" style="text-decoration: none"
                @click="verDetalhes(conta.id)">
                {{ conta.ds_nome }}
              </button>
            </td>
            <td> {{ formattedValue(conta.valor_total) }}</td>
            <td class="text-center">
              {{ conta.dia_vencimento }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AccountDetalheModalComponent v-if="isModalVisible" :show="isModalVisible" :accountsDetail="accountsDetail"
      @close="fecharModal" size="xl" />

  </div>
</template>



<script>
import { ref, onMounted } from 'vue';
import { useToast } from "vue-toastification";
import supabase from '@/utils/supabase';
import AccountDetalheModalComponent from '@/components/AccountDetalheModalComponent.vue';

export default {
  name: 'ListarView',
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

    onMounted(getAccountsByIdUserAutenticated);

    function formattedValue(value) {
            console.log(value);
            return `R$ ${value.toFixed(2).replace('.', ',')}`;
    }

    return {
      accounts,
      loading,
      error,
      verDetalhes,
      fecharModal,
      accountsDetail,
      isModalVisible,
      formattedValue
    };
  }

};
</script>

<style scoped></style>