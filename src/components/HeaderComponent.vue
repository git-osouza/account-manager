<template>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">
                <img src="../assets/prancheta.png" alt="account-manager" width="35" height="36">
                Gerenciador de contas
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup"
                aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav">
                    <RouterLink class="nav-link" to="/Dashboard">
                        Dashboard
                    </RouterLink>
                    <RouterLink class="nav-link" to="/Listar">
                        Listar
                    </RouterLink>
                    <RouterLink class="nav-link" to="/Cadastrar">
                        Cadastrar
                    </RouterLink>
                    <a href="#" class="nav-link" @click="logoff">
                        Sair
                    </a>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
import { logoff } from '@/services/auth/loginService';

export default {
    name: 'HeaderComponent',
    data() {
        return {
        };
    },
    methods: {
        async logoff() {
            await logoff();
        }
    }
};



</script>


<style scoped></style>