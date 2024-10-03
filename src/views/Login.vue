<template>
  <div class="container">
    <h2 class="pb-4">ACCOUNT MANAGER</h2>
    <form @submit.prevent="login">

      <div class="form-floating mb-3">
        <input type="text" v-model="username" class="form-control" id="floatingInput" placeholder="Usuário">
        <label for="floatingInput">Usuário</label>
      </div>
      <div class="form-floating mb-3">
        <input type="password" v-model="senha" class="form-control" id="floatingPassword" placeholder="Senha">
        <label for="floatingPassword">Senha</label>
      </div>

      <button type="submit" class="btn btn-dark"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
          fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
          <path fill-rule="evenodd"
            d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
        </svg></button>
    </form>
  </div>
</template>


<script>
import router from '@/router';
import loginService from '@/services/loginService';


export default {
  name: 'LoginPage',
  data() {
    return {};
  },
  methods: {
    async login() {
      const isAuthenticate = await loginService.authenticate(this.username, this.senha);
      if (isAuthenticate.sucess) {
        router.push({ name: 'Home' });
      }
    }
  }
};
</script>

<style scoped>
.form-control {
  border-radius: 25px;
  height: 50px;
}

.btn {
  border-radius: 50%;
}
</style>