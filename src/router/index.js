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
  if (to.name !== 'Login' && !token) {
    next({ name: 'Login' });
  } else {
    try {
      const validation = await validateToken(token);
      if (validation.valid) {
        next();
      } else {
        next({ name: 'Login' });
      }
    } catch (error) {
      next({ name: 'Login' });
    }
  }
});


export default router;
