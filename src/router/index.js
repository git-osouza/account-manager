import { createRouter, createWebHistory } from 'vue-router';
import CadastrarView from '@/views/CadastrarView.vue';
import ListarView from '@/views/ListarView.vue';
import LoginView from '@/views/LoginView.vue';
import { validateToken } from '@/services/loginService';

const routes = [
  { path: '/', name: 'Login', component: LoginView },
  { path: '/Cadastrar', name: 'Cadastrar', component: CadastrarView, meta: { requiresAuth: true } },
  { path: '/Listar', name: 'Listar', component: ListarView, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.name === 'Login' && token) {
    return next({ name: 'Listar' });
  }

  if (to.name !== 'Login' && !token) {
    return next({ name: 'Login' });
  }

  if (token) {
    try {
      const validation = await validateToken(token);
      if (validation.valid) {
        return next();
      } else {
        localStorage.removeItem('token');
        return next({ name: 'Login' });
      }
    } catch (error) {
      localStorage.removeItem('token');
      return next({ name: 'Login' });
    }
  }
  return next();
});

export default router;
