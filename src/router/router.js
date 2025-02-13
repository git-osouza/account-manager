import { createRouter, createWebHistory } from 'vue-router';
import CadastrarView from '@/views/CadastrarView.vue';
import ListarView from '@/views/ListarView.vue';
import LoginView from '@/views/LoginView.vue';
import { validateAutentication } from '@/services/auth/loginService';
import DashboardView from '@/views/DashboardView.vue';

const routes = [
  { path: '/', name: 'Login', component: LoginView },
  { path: '/Cadastrar', name: 'Cadastrar', component: CadastrarView, meta: { requiresAuth: true } },
  { path: '/Listar', name: 'Listar', component: ListarView, meta: { requiresAuth: true } },
  { path: '/Dashboard', name: 'Dashboard', component: DashboardView, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const validation = await validateAutentication();

  if (to.name === 'Login' && validation) {
    return next({ name: 'Dashboard' });
  }

  if (to.name !== 'Login' && !validation) {
    return next({ name: 'Login' });
  }

  if (validation) {
    try {
      if (validation) {
        return next();
      } else {
        return next({ name: 'Login' });
      }
    } catch (error) {
      return next({ name: 'Login' });
    }
  }
  return next();
});

export default router;
