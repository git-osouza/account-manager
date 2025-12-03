<template>
  <div class="container">
    <HeaderComponent v-if="!isLoginPage" @change-view="setView" />
    <div class="content">
      <component :is="currentComponent" @login-success="onLoginSuccess" @change-view="setView" />
    </div>
    <FooterComponent v-if="!isLoginPage" />
  </div>
</template>

<script>
import FooterComponent from './components/FooterComponent.vue';
import HeaderComponent from './components/HeaderComponent.vue';
import { computed, ref, onMounted } from 'vue';
import supabase from '@/utils/supabase';
import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import ListarView from '@/views/ListarView.vue';
import CadastrarView from '@/views/CadastrarView.vue';


export default {
  name: 'App',
  components: {
    HeaderComponent,
    FooterComponent
  },
  setup() {
    const currentView = ref('Login');

    const views = {
      Login: LoginView,
      Dashboard: DashboardView,
      Listar: ListarView,
      Cadastrar: CadastrarView,
    };

    const currentComponent = computed(() => views[currentView.value] || LoginView);
    const isLoginPage = computed(() => currentView.value === 'Login');

    const setView = (viewName) => {
      if (views[viewName]) {
        currentView.value = viewName;
      }
    };

    const onLoginSuccess = () => {
      currentView.value = 'Dashboard';
    };

    onMounted(async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSessionFromUrl();
        if (sessionError) {
          currentView.value = 'Login';
        } else if (sessionData && sessionData.session) {
          currentView.value = 'Dashboard';
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          currentView.value = user ? 'Dashboard' : 'Login';
        }
      } catch {
        currentView.value = 'Login';
      }

      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          currentView.value = 'Login';
        }
        if (event === 'SIGNED_IN' && session) {
          currentView.value = 'Dashboard';
        }
      });
    });

    return {
      isLoginPage,
      currentComponent,
      setView,
      onLoginSuccess,
    };
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 10px;
  margin: 5px;
  padding: 5px;
}

.content {
  padding-top: 50px;
}

.container {
  margin: 0 auto;
  padding: 20px;
  border-radius: 10px;
}

h2 {
  text-align: center;

}
</style>
