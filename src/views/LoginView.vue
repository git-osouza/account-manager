<template>
  <div class="login-card-container">
    <div class="glass-card login-card">
      <div class="text-center mb-4">
        <img
src="../assets/account-manager.png"
alt="logo"
class="logo-img mb-2"
width="100"
height="100"
>
        <h3 class="fw-bold mt-2">
Gerenciador de Contas
</h3>
        <p class="text-secondary small">
Entre com suas credenciais ou conta social
</p>
      </div>

      <form @submit.prevent="signInPassword">
        <div class="form-floating mb-3">
          <input 
            id="floatingInput" 
            v-model="user.email" 
            type="email" 
            class="form-control" 
            placeholder="nome@exemplo.com"
            required
          >
          <label for="floatingInput">E-mail</label>
        </div>

        <div class="form-floating mb-4">
          <input 
            id="floatingPassword" 
            v-model="user.password" 
            type="password" 
            class="form-control" 
            placeholder="Senha"
            required
          >
          <label for="floatingPassword">Senha</label>
        </div>

        <button
type="submit"
class="btn-primary-gradient w-100 py-3 mb-4 d-flex align-items-center justify-content-center gap-2"
>
          <span>Entrar</span>
          <svg
xmlns="http://www.w3.org/2000/svg"
width="18"
height="18"
fill="currentColor"
class="bi bi-box-arrow-in-right"
viewBox="0 0 16 16"
>
            <path
fill-rule="evenodd"
d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"
/>
            <path
fill-rule="evenodd"
d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
/>
          </svg>
        </button>
      </form>

      <div class="auth-divider mb-4">
        <span>ou continuar com</span>
      </div>

      <div class="d-flex justify-content-center">
        <button
class="btn-github-auth w-100 py-2 d-flex align-items-center justify-content-center gap-2"
@click="signInOAuth('github')"
>
          <svg
xmlns="http://www.w3.org/2000/svg"
width="20"
height="20"
fill="currentColor"
class="bi bi-github"
viewBox="0 0 16 16"
>
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
          </svg>
          <span>GitHub</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { signInWithPassword } from '@/services/auth/loginService';
import { signInWithOAuth } from '@/services/auth/loginService';

export default {
  name: 'LoginView',
  emits: ['login-success'],
  setup(props, { emit }) {
    const user = reactive({
      email: '',
      password: ''
    });

    const signInPassword = async () => {
      if (user.email === '' || user.password === '') {
        return;
      }
      const ok = await signInWithPassword(user.email, user.password);
      if (ok) emit('login-success');
    };

    const signInOAuth = async (provider) => {
      await signInWithOAuth(provider);
    };

    return {
      user,
      signInPassword,
      signInOAuth
    };
  }
};
</script>

<style scoped>
.login-card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.login-card {
  max-width: 420px;
  width: 100%;
  padding: 2.5rem;
  border-radius: 24px;
}

.logo-img {
  filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.4));
  transition: transform 0.3s ease;
}
.login-card:hover .logo-img {
  transform: scale(1.05) rotate(3deg);
}

.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}
.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.auth-divider:not(:empty)::before {
  margin-right: .5em;
}
.auth-divider:not(:empty)::after {
  margin-left: .5em;
}

.btn-github-auth {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.btn-github-auth:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.16);
  color: #fff;
  transform: translateY(-1px);
}
.btn-github-auth:active {
  transform: translateY(0);
}
</style>

