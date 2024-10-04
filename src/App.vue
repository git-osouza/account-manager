<template>
  <div class="container">
    <HeaderComponent v-if="!isLoginPage"/>
    <router-view />
    <FooterComponent v-if="!isLoginPage"/>
  </div>
</template>

<script>
import FooterComponent from './components/FooterComponent.vue';
import HeaderComponent from './components/HeaderComponent.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';


export default {
  name: 'App',
  components: {
    HeaderComponent,
    FooterComponent
  },
  setup() {
    const route = useRoute();

    const isLoginPage = computed(() => route.name === 'Login');

    return {
      isLoginPage,
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

.container {
  margin: 0 auto;
  padding: 20px;
  border-radius: 10px;
}

h2 {
  text-align: center;

}
</style>
