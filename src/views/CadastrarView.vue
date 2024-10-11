<template>
  <div class="container">
    <form @submit.prevent="insert">
      <div class="form-floating mb-3">
        <input type="text" v-model="insertVo.conta" class="form-control" id="floatingInput" placeholder="Nome Conta"
          required>
        <label for="floatingInput">Conta</label>
      </div>
      <div class="row">
        <div class="col-6">
          <div class="form-floating mb-3">
            <input type="text" v-model="insertVo.valor" class="form-control" id="floatingInput" placeholder="Valor"
              required>
            <label for="floatingInput">Valor</label>
          </div>
        </div>
        <div class="col-6">
          <div class="form-floating mb-3">
            <input type="number" v-model="insertVo.parcelas" class="form-control" id="floatingInput"
              placeholder="Nº Parcelas" required>
            <label for="floatingInput">Nº Parcelas</label>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <div class="form-floating mb-3">
            <input type="number" v-model="insertVo.diaVencimento" class="form-control" id="floatingInput"
              placeholder="Vencimento" required>
            <label for="floatingInput">Venc.</label>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-center">
        <button type="submit" class="btn btn-dark">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-floppy"
            viewBox="0 0 16 16">
            <path d="M11 2H9v3h2z" />
            <path
              d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z" />
          </svg>
        </button>
        <button type="button" class="btn btn-dark ml-3" @click="clear()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle"
            viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path
              d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
          </svg>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import axiosInstance from '@/services/http';
import { reactive, onMounted } from 'vue';
import { useToast } from "vue-toastification";

export default {
  name: 'CadastrarView',
  setup() {
    const toast = useToast();
    const insertVo = reactive({
      id: '',
      conta: '',
      valor: '',
      parcelas: '',
      diaVencimento: '',
    });

    const insert = async () => {
      let arrInsert = [];
      for (let i = 0; i < insertVo.parcelas; i++) {
        insertVo.id = Number(Math.ceil(Math.random() * 1000000));
        insertVo.valor = parseFloat(insertVo.valor.replace(',', '.')).toFixed(2);
        insertVo.parcelas = Number(insertVo.parcelas);
        insertVo.diaVencimento = Number(insertVo.diaVencimento);
        const resp = (await axiosInstance.post('/insert.php', insertVo)).data;
        arrInsert.push(resp.success);
      }

      if (arrInsert.length > 0) {
        const index = arrInsert.indexOf(false);
        if (index === -1) {
          toast.success('Registro inserido com sucesso!');
        } else {
          toast.error('Erro ao inserir o registro');
        }
      }
      clear();
    };

    const clear = () => {
      insertVo.id = '';
      insertVo.conta = '';
      insertVo.valor = '';
      insertVo.parcelas = '';
      insertVo.diaVencimento = '';
    };

    onMounted(() => {
    });

    return {
      insertVo,
      insert,
      clear
    };
  }
};
</script>

<style scoped>
.form-control {
  border-radius: 15px;
}

.btn {
  border-radius: 50%;
  background-color: #34495e;
}

.bi-x-circle,
.bi-floppy {
  color: #41b883;
}
</style>
