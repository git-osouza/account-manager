<template>
  <div class="container">
    <form @submit.prevent="insertMultipleAccounts">
      <div class="row">
        <div class="col-6">
          <div class="form-floating mb-3">
            <select v-model="insertVo.categoria" class="form-select" id="floatingSelect" required>
              <option disabled value="">Selecione uma categoria</option>
              <option value="despesas-fixas">🏠 Despesas Fixas</option>
              <option value="transporte">🚗 Transporte</option>
              <option value="alimentacao">🛒 Alimentação</option>
              <option value="saude">🩺 Saúde</option>
              <option value="educacao">🎓 Educação</option>
              <option value="dividas-pagamentos">💳 Dívidas e Pagamentos</option>
              <option value="lazer-entretenimento">🎉 Lazer e Entretenimento</option>
              <option value="manutencao-casa">🛠️ Manutenção e Casa</option>
              <option value="despesas-pessoais">👔 Despesas Pessoais</option>
              <option value="investimentos-poupanca">📈 Investimentos e Poupança</option>
            </select>
            <label for="floatingSelect">Categoria</label>
          </div>
        </div>
        <div class="col-6">
          <div class="form-floating mb-3">
            <input type="text" v-model="insertVo.ds_nome" class="form-control" id="floatingInput"
              placeholder="Nome Conta" required>
            <label for="floatingInput">Nome conta</label>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <div class="form-floating mb-3">
            <input type="text" v-model="parcelas.valor_parcela" class="form-control" id="floatingInput"
              placeholder="Valor" required>
            <label for="floatingInput">Valor</label>
          </div>
        </div>
        <div class="col-6">
          <div class="form-floating mb-3">
            <input type="number" v-model="parcelas.nr_parcelas" class="form-control" id="floatingInput"
              placeholder="Nº Parcelas" required>
            <label for="floatingInput">Nº parcelas</label>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <div class="form-floating mb-3">
            <input type="number" v-model="insertVo.dia_vencimento" class="form-control" id="floatingInput"
              placeholder="Vencimento" required>
            <label for="floatingInput">Dia vencimento</label>
          </div>
        </div>
        <div class="col-6">
          <div class="form-floating mb-3">
            <input type="date" v-model="parcelas.dt_vencimento" class="form-control" id="floatingInput"
              placeholder="Vencimento" required>
            <label for="floatingInput">Data 1° vencimento</label>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-center gap-3">
        <button type="submit" class="btn btn-dark">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-floppy-fill"
            viewBox="0 0 16 16">
            <path
              d="M0 1.5A1.5 1.5 0 0 1 1.5 0H3v5.5A1.5 1.5 0 0 0 4.5 7h7A1.5 1.5 0 0 0 13 5.5V0h.086a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5H14v-5.5A1.5 1.5 0 0 0 12.5 9h-9A1.5 1.5 0 0 0 2 10.5V16h-.5A1.5 1.5 0 0 1 0 14.5z" />
            <path
              d="M3 16h10v-5.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zm9-16H4v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5zM9 1h2v4H9z" />
          </svg>
        </button>

        <button type="button" class="btn btn-dark" @click="clear()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill"
            viewBox="0 0 16 16">
            <path
              d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
          </svg>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { reactive, onMounted } from 'vue';
import { useToast } from "vue-toastification";
import supabase from '@/utils/supabase';

export default {
  name: 'CadastrarView',
  setup() {
    const toast = useToast();
    const parcelas = reactive({
      nr_parcelas: '',
      valor_parcela: '',
      dt_vencimento: '',
      status: 'Pendente'
    });
    const insertVo = reactive({
      ds_nome: '',
      categoria: '',
      valor_total: '',
      dia_vencimento: ''
    });

    async function insertMultipleAccounts() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: accountResult, error: accountError } = await supabase
          .from('account')
          .insert({
            ds_nome: insertVo.ds_nome,
            valor_total: parcelas.valor_parcela * parcelas.nr_parcelas,
            dia_vencimento: insertVo.dia_vencimento,
            user_id: user.id,
            categoria: insertVo.categoria
          })
          .select();

        if (accountError) {
          console.error('Erro ao inserir contas', accountError);
          toast.error('Ocorreu algum erro ao inserir as contas');
          return null;
        }

        const primeiroVencimento = new Date(parcelas.dt_vencimento);
        const accountsParcelas = new Array(Number(parcelas.nr_parcelas)).fill(0).map((_, index) => {
          let dataParcela;

          if (index === 0) {
            // Primeira parcela: usa a data do primeiro vencimento
            dataParcela = new Date(primeiroVencimento);
          } else {
            // Parcelas subsequentes: usa o dia fixo e incrementa o mês conforme as parcelas
            dataParcela = new Date(primeiroVencimento);
            dataParcela.setMonth(primeiroVencimento.getMonth() + index);
            dataParcela.setDate(insertVo.dia_vencimento - 1);
          }

          return {
            id_account: accountResult[0].id,
            numero_parcela: index + 1,
            valor_parcela: parcelas.valor_parcela,
            dt_vencimento: dataParcela,
            status: parcelas.status
          };
        });

        const { error: parcelasError } = await supabase
          .from('account_parcelas')
          .insert(accountsParcelas);

        if (parcelasError) {
          console.error('Erro ao inserir parcelas', parcelasError);
          toast.error('Ocorreu algum erro ao inserir as parcelas');
          return null;
        }
        toast.success('Contas inseridas com sucesso');
        clear();
      }
    }

    function formattedValue(value) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    }

    const clear = () => {
      insertVo.ds_nome = '';
      insertVo.valor_total = '';
      insertVo.dia_vencimento = '';
      insertVo.categoria = '';
      parcelas.nr_parcelas = '';
      parcelas.valor_parcela = '';
      parcelas.dt_vencimento = '';
    };

    onMounted(() => {
    });

    return {
      insertVo,
      parcelas,
      clear,
      insertMultipleAccounts,
      formattedValue
    };
  }
};
</script>

<style scoped>
.form-control {
  border-radius: 15px;
}
</style>
