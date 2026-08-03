<template>
  <nav class="premium-navbar py-2 px-3 mb-4">
    <div class="d-flex align-items-center justify-content-between w-100 flex-wrap gap-2">
      <!-- Caso esteja no Dashboard: Mostrar Logo e Menu Principal -->
      <template v-if="currentView === 'Dashboard'">
        <div class="d-flex align-items-center gap-2">
          <img
src="../assets/prancheta.png"
alt="logo"
width="30"
height="31"
class="brand-logo"
>
          <span class="brand-text text-gradient d-none d-sm-inline">Gerenciador de Contas</span>
        </div>
        
        <div class="d-flex align-items-center gap-2">
          <button
class="nav-btn-premium active"
@click.prevent="$emit('change-view','Dashboard')"
>
            <span class="btn-icon">📊</span>
            <span class="btn-label d-none d-md-inline">Dashboard</span>
          </button>
          
          <button
class="nav-btn-premium"
@click.prevent="$emit('change-view','Listar')"
>
            <span class="btn-icon">📋</span>
            <span class="btn-label d-none d-md-inline">Listar Contas</span>
            <span class="btn-label d-inline d-md-none">Listar</span>
          </button>
          
          <button
class="nav-btn-premium"
@click.prevent="$emit('change-view','Cadastrar')"
>
            <span class="btn-icon">➕</span>
            <span class="btn-label d-none d-md-inline">Nova Conta</span>
            <span class="btn-label d-inline d-md-none">Cadastrar</span>
          </button>
          
          <button
            :class="['nav-btn-premium', { active: currentView === 'AssistenteIA' }]"
            @click.prevent="$emit('change-view','AssistenteIA')"
          >
            <span class="btn-icon">🤖</span>
            <span class="btn-label d-none d-md-inline">Assistente IA</span>
            <span class="btn-label d-inline d-md-none">IA</span>
          </button>
          
          <span class="vertical-divider mx-1" />
          
          <button
class="nav-btn-premium logout-btn"
@click.prevent="logoff"
>
            <span class="btn-icon">🚪</span>
            <span class="btn-label d-none d-sm-inline">Sair</span>
          </button>
        </div>
      </template>

      <!-- Caso esteja em outra tela (Listar/Cadastrar): Mostrar Botão "Voltar ao Dashboard" -->
      <template v-else>
        <div class="d-flex align-items-center gap-3">
          <button
class="btn-back-card d-flex align-items-center gap-2"
@click.prevent="$emit('change-view','Dashboard')"
>
            <svg
xmlns="http://www.w3.org/2000/svg"
width="16"
height="16"
fill="currentColor"
class="bi bi-arrow-left-short"
viewBox="0 0 16 16"
>
              <path
fill-rule="evenodd"
d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"
/>
            </svg>
            <span>Voltar ao Dashboard</span>
          </button>
          <span class="page-title-badge text-capitalize d-none d-sm-inline-block">{{ currentView }}</span>
        </div>

        <div class="d-flex align-items-center gap-2">
          <!-- Atalho rápido entre Cadastrar e Listar quando fora do Dashboard -->
          <button 
            v-if="currentView === 'Listar'" 
            class="nav-btn-premium-compact" 
            @click.prevent="$emit('change-view','Cadastrar')"
          >
            <span>➕ Nova Conta</span>
          </button>
          <button 
            v-if="currentView === 'Cadastrar'" 
            class="nav-btn-premium-compact" 
            @click.prevent="$emit('change-view','Listar')"
          >
            <span>📋 Listar Contas</span>
          </button>

          <span class="vertical-divider mx-1" />
          
          <button
class="nav-btn-premium logout-btn-compact"
title="Sair"
@click.prevent="logoff"
>
            <span>🚪</span>
          </button>
        </div>
      </template>
    </div>
  </nav>
</template>

<script>
import { logoff } from '@/services/auth/loginService';

export default {
  name: 'HeaderComponent',
  props: {
    currentView: {
      type: String,
      default: 'Dashboard'
    }
  },
  emits: ['change-view'],
  methods: {
    async logoff() {
      await logoff();
      this.$emit('change-view', 'Login');
    }
  }
};
</script>

<style scoped>
.premium-navbar {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
}

.brand-logo {
  filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.5));
}

.brand-text {
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: -0.02em;
}

/* Botões Menu Principal */
.nav-btn-premium {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  border-radius: 12px;
  padding: 0.5rem 0.85rem;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.nav-btn-premium:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}
.nav-btn-premium.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.25);
  color: #a5b4fc;
}

.vertical-divider {
  width: 1px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.12);
  align-self: center;
}

.logout-btn {
  color: var(--color-danger);
}
.logout-btn:hover {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-color: rgba(244, 63, 94, 0.2);
}

/* Botão Voltar como Card */
.btn-back-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.88rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.btn-back-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #fff;
  transform: translateX(-2px);
}
.btn-back-card svg {
  transition: transform 0.2s ease;
}
.btn-back-card:hover svg {
  transform: translateX(-2px);
}

.page-title-badge {
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 8px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.nav-btn-premium-compact {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  border-radius: 10px;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 550;
  transition: all 0.2s ease;
}
.nav-btn-premium-compact:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.logout-btn-custom {
  color: var(--color-danger);
}
.logout-btn-custom:hover {
  background: var(--color-danger-bg);
  color: var(--color-danger);
  border-color: rgba(244, 63, 94, 0.2);
}

.logout-btn-compact {
  background: transparent;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}
.logout-btn-compact:hover {
  background: var(--color-danger-bg);
}
</style>