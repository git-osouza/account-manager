<template>
  <HeaderComponent/>
  <router-view />
</template>

<script>
import HeaderComponent from './components/HeaderComponent.vue';


export default {
  name: 'App',
  components: {
    HeaderComponent
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
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
