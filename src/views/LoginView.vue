<template>
  <div class="container login">
    <figure class="figure text-center d-flex justify-content-center">
      <img src="../assets/account-manager.png" class="figure-img img-fluid rounded" width="140" height="140">
    </figure>
    <form @submit.prevent="handleLogin">
      <div class="form-floating mb-3">
        <input type="text" v-model="user.username" class="form-control" id="floatingInput" placeholder="Usuário">
        <label for="floatingInput">Usuário</label>
      </div>
      <div class="form-floating mb-3">
        <input type="password" v-model="user.senha" class="form-control" id="floatingPassword" placeholder="Senha">
        <label for="floatingPassword">Senha</label>
      </div>
      <div class="d-flex justify-content-center">
        <button type="submit" class="btn btn-dark">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right"
            viewBox="0 0 16 16">
            <path fill-rule="evenodd"
              d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
          </svg>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { reactive, onMounted } from 'vue';
import { login, validateToken } from '@/services/loginService';
import router from '@/router';
import { useToast } from "vue-toastification";

export default {
  name: 'LoginView',
  setup() {
    const toast = useToast();
    const user = reactive({
      username: '',
      senha: ''
    });

    const handleLogin = async () => {
      try {
        const { token } = await login(user);
        localStorage.setItem('token', token);
        router.push({ name: 'Cadastrar' });
      } catch (error) {
        console.error('Erro ao fazer login', error);
        toast.error('Usuário ou senha inválidos!');
      }
    };

    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const result = await validateToken(token);
          if (result.valid) {
            console.log('Token válido!');
            router.push({ name: 'Cadastrar' });
          } else {
            console.log('Token inválido!');
            localStorage.removeItem('token');
            router.push({ name: 'Login' });
          }
        } catch (error) {
          console.error('Erro ao validar token', error);
          localStorage.removeItem('token');
          router.push({ name: 'Login' });
        }
      } else {
        router.push({ name: 'Login' });
      }
    };

    onMounted(() => {
      checkToken();
    });

    return {
      user,
      handleLogin,
      checkToken
    };
  }
};
</script>

<style scoped>
.form-control {
  border-radius: 25px;
  height: 50px;
}

.btn {
  border-radius: 50%;
  background-color: #34495e;
}

.bi-arrow-right {
  color: #41b883;
}
</style>
