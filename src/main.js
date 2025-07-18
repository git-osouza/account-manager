import { createApp } from 'vue';
import App from './App.vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import router from './router/router';
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import BootstrapVue3 from 'bootstrap-vue-3';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';

import { supabase } from './utils/supabase';

async function init() {
  try {
    const { data, error } = await supabase.auth.getSessionFromUrl();

    if (error) {
      console.error('Erro na autenticação:', error.message);
      await router.replace({ name: 'Login' });
    } else if (data.session) {
      await router.replace({ name: 'Dashboard' });
    } else {
      await router.replace({ name: 'Login' });
    }
  } catch (err) {
    console.error('Erro inesperado:', err);
    await router.replace({ name: 'Login' });
  }

  const app = createApp(App);
  const options = {};
  app.use(router);
  app.use(Toast, options);
  app.use(BootstrapVue3);
  app.mount('#app');
}

init();
