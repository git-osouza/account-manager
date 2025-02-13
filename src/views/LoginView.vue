<template>
  <div class="container login">
    <figure class="figure text-center d-flex justify-content-center">
      <img src="../assets/account-manager.png" class="figure-img img-fluid rounded" width="140" height="140">
    </figure>
    <form>
      <div class="input-group mb-3">
        <span class="input-group-text">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill"
            viewBox="0 0 16 16">
            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
          </svg>
        </span>
        <div class="form-floating">
          <input type="email" v-model="user.email" class="form-control" id="floatingInput" placeholder="E-mail" required>
          <label for="floatingInput">E-mail</label>
        </div>
      </div>
      <div class="input-group mb-3">
        <span class="input-group-text">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lock-fill"
            viewBox="0 0 16 16">
            <path
              d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2" />
          </svg>
        </span>
        <div class="form-floating">
          <input type="password" v-model="user.password" class="form-control" id="floatingPassword" placeholder="Senha" required>
          <label for="floatingPassword">Senha</label>
        </div>
      </div>
    </form>
    <div class="d-flex justify-content-center gap-3 mb-3">
      <button type="submit" class="btn btn-dark" @click="signInWithPassword">
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

    <span class="text-muted d-flex justify-content-center gap-3 mb-3">Login com redes sociais</span>
    <div class="d-flex justify-content-center gap-3">
      <button class="btn btn-dark" @click="signInWithOAuth">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github"
          viewBox="0 0 16 16">
          <path
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
        </svg>
      </button>
      <button class="btn btn-dark">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-google"
          viewBox="0 0 16 16">
          <path
            d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
        </svg>
      </button>
      <button class="btn btn-dark">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-apple"
          viewBox="0 0 16 16">
          <path
            d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
          <path
            d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
        </svg>
      </button>
    </div>
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

    const signInWithPassword = async () => {
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
          localStorage.setItem('token', '');
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
      const token = true;
      if (token) {
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
      signInWithPassword,
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

.bi-arrow-right {
  color: #41b883;
}

.login {
  max-width: 398px;
  background-color: #8881;
}
</style>
