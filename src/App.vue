<template>
  <div :class="isLoginPage ? 'login-wrapper' : 'container-layout'">
    <HeaderComponent
      v-if="!isLoginPage"
      :current-view="currentView"
      @change-view="setView"
    />
    <div class="content">
      <KeepAlive exclude="LoginView">
        <component
          :is="currentComponent"
          :filter-params="filterParams"
          @login-success="onLoginSuccess"
          @change-view="setView"
          @clear-filter-params="clearFilterParams"
        />
      </KeepAlive>
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
import AssistenteIAView from '@/views/AssistenteIAView.vue';


export default {
  name: 'App',
  components: {
    HeaderComponent,
    FooterComponent
  },
  setup() {
    const currentView = ref('Login');
    const filterParams = ref(null);

    const views = {
      Login: LoginView,
      Dashboard: DashboardView,
      Listar: ListarView,
      Cadastrar: CadastrarView,
      AssistenteIA: AssistenteIAView,
    };

    const currentComponent = computed(() => views[currentView.value] || LoginView);
    const isLoginPage = computed(() => currentView.value === 'Login');

    const setView = (viewName, params = null) => {
      if (views[viewName]) {
        currentView.value = viewName;
        if (params) {
          filterParams.value = params;
        }
      }
    };

    const clearFilterParams = () => {
      filterParams.value = null;
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
      currentView,
      filterParams,
      setView,
      clearFilterParams,
      onLoginSuccess,
    };
  }
}
</script>

<style>
#app {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.container-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.content {
  padding-top: 2rem;
}

h2 {
  text-align: center;
  font-weight: 700;
  margin-bottom: 2rem;
}
</style>
