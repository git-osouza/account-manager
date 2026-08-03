<template>
  <div class="row g-4 justify-content-center">
    <!-- Formulário de Cadastro -->
    <div class="col-lg-7">
      <div class="glass-card">
        <h3 class="fw-bold mb-4 text-gradient d-flex align-items-center gap-2">
          <svg
xmlns="http://www.w3.org/2000/svg"
width="24"
height="24"
fill="currentColor"
class="bi bi-plus-circle-fill text-primary"
viewBox="0 0 16 16"
>
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
          </svg>
          Cadastrar Nova Conta
        </h3>

        <form @submit.prevent="insertMultipleAccounts">
          <div class="row">
            <div class="col-md-6">
              <div class="form-floating mb-3">
                <select
id="floatingSelect"
v-model="insertVo.categoria"
class="form-select"
required
>
                  <option
disabled
value=""
>
Selecione uma categoria
</option>
                  <option value="despesas-fixas">
🏠 Despesas Fixas
</option>
                  <option value="transporte">
🚗 Transporte
</option>
                  <option value="alimentacao">
🛒 Alimentação
</option>
                  <option value="saude">
🩺 Saúde
</option>
                  <option value="educacao">
🎓 Educação
</option>
                  <option value="dividas-pagamentos">
💳 Dívidas e Pagamentos
</option>
                  <option value="lazer-entretenimento">
🎉 Lazer e Entretenimento
</option>
                  <option value="manutencao-casa">
🛠️ Manutenção e Casa
</option>
                  <option value="despesas-pessoais">
👔 Despesas Pessoais
</option>
                  <option value="investimentos-poupanca">
📈 Investimentos e Poupança
</option>
                </select>
                <label for="floatingSelect">Categoria</label>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="form-floating mb-3">
                <input 
                  id="floatingInputName" 
                  v-model="insertVo.ds_nome" 
                  type="text" 
                  class="form-control"
                  placeholder="Nome Conta" 
                  required
                >
                <label for="floatingInputName">Nome da Conta</label>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-floating mb-3">
                <input 
                  id="floatingInputVal" 
                  v-model="parcelas.valor_parcela"
                  type="number" 
                  step="0.01" 
                  class="form-control"
                  placeholder="Valor Parcela" 
                  required
                >
                <label for="floatingInputVal">Valor da Parcela</label>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-floating mb-3">
                <input 
                  id="floatingInputNum" 
                  v-model="parcelas.nr_parcelas" 
                  type="number" 
                  class="form-control"
                  placeholder="Nº Parcelas" 
                  required
                >
                <label for="floatingInputNum">Nº de Parcelas</label>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-floating mb-3">
                <input 
                  id="floatingInputDia" 
                  v-model="insertVo.dia_vencimento" 
                  type="number"
                  min="1" 
                  max="31" 
                  class="form-control"
                  placeholder="Vencimento" 
                  required
                >
                <label for="floatingInputDia">Dia de Vencimento Fixo</label>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-floating mb-3">
                <input 
                  id="floatingInputDate" 
                  v-model="parcelas.dt_vencimento" 
                  type="date" 
                  class="form-control"
                  placeholder="Vencimento" 
                  required
                >
                <label for="floatingInputDate">Data da 1ª Parcela</label>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-3 mt-4">
            <button
type="button"
class="btn-glass px-4"
@click="clear"
>
Limpar
</button>
            <button
type="submit"
class="btn-primary-gradient px-4 d-flex align-items-center gap-2"
>
              <svg
xmlns="http://www.w3.org/2000/svg"
width="16"
height="16"
fill="currentColor"
class="bi bi-floppy-fill"
viewBox="0 0 16 16"
>
                <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0H3v5.5A1.5 1.5 0 0 0 4.5 7h7A1.5 1.5 0 0 0 13 5.5V0h.086a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5H14v-5.5A1.5 1.5 0 0 0 12.5 9h-9A1.5 1.5 0 0 0 2 10.5V16h-.5A1.5 1.5 0 0 1 0 14.5z" />
                <path d="M3 16h10v-5.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zm9-16H4v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5zM9 1h2v4H9z" />
              </svg>
              <span>Salvar Conta</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Preview em tempo real das parcelas -->
    <div class="col-lg-5">
      <div class="glass-card h-100 preview-card">
        <h4 class="fw-bold mb-3 text-white">
Visualização de Parcelas
</h4>
        <p class="text-secondary small mb-4">
Insira os dados da conta para ver a projeção das parcelas geradas no banco.
</p>

        <div
v-if="previewParcelas.length > 0"
class="preview-list"
>
          <div class="preview-total mb-3 p-3 rounded bg-dark-semi d-flex justify-content-between align-items-center">
            <span class="text-secondary small">VALOR TOTAL DA CONTA:</span>
            <span class="fw-bold text-gradient fs-5">{{ formattedValue(parcelas.valor_parcela * parcelas.nr_parcelas) }}</span>
          </div>

          <div class="scrollable-preview-container">
            <div 
              v-for="item in previewParcelas" 
              :key="item.numero" 
              class="preview-item d-flex justify-content-between align-items-center py-2 px-3 mb-2 rounded border-item-premium"
            >
              <div class="d-flex align-items-center gap-2">
                <span class="badge-number">{{ item.numero }}</span>
                <span class="text-white font-monospace">{{ item.dataStr }}</span>
              </div>
              <span class="fw-semibold text-primary-light">{{ formattedValue(item.valor) }}</span>
            </div>
          </div>
        </div>

        <div
v-else
class="h-75 d-flex flex-column align-items-center justify-content-center text-center p-4"
>
          <svg
xmlns="http://www.w3.org/2000/svg"
width="48"
height="48"
fill="currentColor"
class="bi bi-clock-history text-muted mb-3"
viewBox="0 0 16 16"
>
            <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654.5.5 0 0 1-.368.855c-.244-.12-.48-.23-.665-.368zm1.094 1.201a6.9 6.9 0 0 0-.617-.43c-.224-.136-.454-.265-.688-.383l.494-.87c.285.16.568.337.838.529a8 8 0 0 1 1.026.862zm.88 1.488a7 7 0 0 0-.47-.63l.71-.71a8 8 0 0 1 .63.897.5.5 0 0 1-.87.443z" />
            <path d="M8.5 4.466V1.75a.75.75 0 0 0-1.5 0v2.925a.75.75 0 0 0 .22.53l2 2a.75.75 0 1 0 1.06-1.06z" />
          </svg>
          <span class="text-secondary small">Aguardando dados de simulação...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed } from 'vue';
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

    const previewParcelas = computed(() => {
      if (!parcelas.nr_parcelas || !parcelas.valor_parcela || !parcelas.dt_vencimento || !insertVo.dia_vencimento) {
        return [];
      }
      
      const num = Math.min(Number(parcelas.nr_parcelas), 120); // Cap preventivo
      const val = Number(parcelas.valor_parcela);
      const primeiroVencimento = new Date(parcelas.dt_vencimento);
      const diaVenc = Number(insertVo.dia_vencimento);

      const items = [];
      for (let index = 0; index < num; index++) {
        let dataParcela;

        if (index === 0) {
          dataParcela = new Date(primeiroVencimento);
        } else {
          dataParcela = new Date(primeiroVencimento);
          dataParcela.setMonth(primeiroVencimento.getMonth() + index);
          dataParcela.setDate(diaVenc - 1);
        }

        const dateStr = dataParcela.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });

        items.push({
          numero: index + 1,
          valor: val,
          dataStr: dateStr
        });
      }
      return items;
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
            dataParcela = new Date(primeiroVencimento);
          } else {
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

    return {
      insertVo,
      parcelas,
      previewParcelas,
      clear,
      insertMultipleAccounts,
      formattedValue
    };
  }
};
</script>

<style scoped>
.preview-card {
  display: flex;
  flex-direction: column;
}

.bg-dark-semi {
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.scrollable-preview-container {
  max-height: 350px;
  overflow-y: auto;
  padding-right: 4px;
}

.border-item-premium {
  border: 1px solid rgba(255, 255, 255, 0.04);
  background-color: rgba(255, 255, 255, 0.02);
  transition: background-color 0.2s ease;
}
.border-item-premium:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.badge-number {
  background-color: var(--primary-color);
  color: #fff;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.text-primary-light {
  color: #a5b4fc;
}
</style>

