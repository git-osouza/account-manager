<template>
  <div class="container login">
    <figure class="figure text-center d-flex justify-content-center">
      <img src="../assets/account-manager.png" class="figure-img img-fluid rounded" width="140" height="140">
    </figure>
    <form @submit.prevent="handleLogin">
      <div class="form-floating mb-3">
        <input type="email" v-model="user.email" class="form-control" id="floatingInput" placeholder="E-mail">
        <label for="floatingInput">E-mail</label>
      </div>
      <div class="form-floating mb-3">
        <input type="password" v-model="user.password" class="form-control" id="floatingPassword" placeholder="Senha">
        <label for="floatingPassword">Senha</label>
      </div>
      <div class="d-flex justify-content-center">
        <button class="btn btn-dark" @click="signInWithOAuth">
          Entrar com GitHub
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github"
            viewBox="0 0 16 16">
            <path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
          </svg>
        </button>
        <button type="submit" class="btn btn-dark">
          Entrar
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            class="bi bi-box-arrow-in-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd"
              d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z" />
            <path fill-rule="evenodd"
              d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z" />
          </svg>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { reactive, onMounted } from 'vue';
import router from '@/router';
import { useToast } from "vue-toastification";
import supabase from '@/utils/supabase';

export default {
  name: 'LoginView',
  setup() {
    const toast = useToast();
    const user = reactive({
      email: '',
      password: ''
    });

    const handleLogin = async () => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password
        });

        if (error) {
          console.error('Erro ao fazer login com email e senha', error);
          toast.error('Erro ao fazer login com e-mail e senha');
        } else {
          console.log('Usuário logado com sucesso', data);
          localStorage.setItem('token', data.session.access_token);
          router.push({ name: 'Cadastrar' });
        }
      } catch (err) {
        console.error('Erro ao fazer login', err);
        toast.error('Erro ao fazer login com e-mail e senha');
      }
    };

    const signInWithOAuth = async () => {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'github'
        });

        if (error) {
          console.error('Erro ao fazer login com GitHub', error);
          toast.error('Erro ao fazer login com GitHub');
        } else {
          router.push({ name: 'Cadastrar' });
        }
      } catch (err) {
        console.error('Erro ao fazer login', err);
        toast.error('Erro ao fazer login com GitHub');
      }
    };


    const checkToken = async () => {
      const { provider_token } = JSON.parse(localStorage.getItem('sb-mzuppxztdccfoaordyix-auth-token'));
      if (provider_token) {
        console.log('Token válido!');
        router.push({ name: 'Cadastrar' });
      } else {
        console.error('Token inválido!');
        router.push({ name: 'Login' });
      }
    };

    onMounted(() => {
      checkToken();
    });

    return {
      user,
      handleLogin,
      signInWithOAuth
    };
  }
};
</script>

<style scoped>
.form-control {
  border-radius: 15px;
  height: 50px;
}

.btn {
  background-color: #34495e;
}

.bi-arrow-right {
  color: #41b883;
}
</style>
