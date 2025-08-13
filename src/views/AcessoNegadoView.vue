<template>
  <div class="acesso-negado-container">
    <div class="box">
      <img src="../assets/logosvg.svg" alt="Logo" class="logo">
      <h1>Acesso Negado</h1>    
      <p>
        Você não tem permissão para aceder à página solicitada.
      </p>
      <p>
        O seu perfil é: <strong>{{ perfilUsuario }}</strong>
      </p>
      <button @click="irParaInicio" class="button-primary">
        Ir para minha página inicial
      </button>
      <button @click="fazerLogout" class="button-secondary">
        Sair
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const perfilUsuario = computed(() => authStore.user?.perfil.nome || 'Desconhecido');

function irParaInicio() {
  // Reutiliza a mesma lógica de redirecionamento da store
  const perfil = perfilUsuario.value;
  switch (perfil) {
    case 'Administrador - Geral':
      router.push({ name: 'Monitoramento' });
      break;
    case 'ALMOX - Atendimento':
      router.push({ name: 'Requisicao' });
      break;
    case 'ALMOX - Separação':
      router.push({ name: 'Separacao' });
      break;
      case 'ALMOX - Conferência':
      router.push({ name: 'Conferencia' });
      break;
      case 'ALMOX - Embalagem':
      router.push({ name: 'Embalagem' });
      break;
      case 'ALMOX - Expedição':
      router.push({ name: 'Remessa' });
      break;
    default:
      // Se não souber para onde ir, faz logout por segurança
      authStore.logout();
      break;
  }
}

function fazerLogout() {
  authStore.logout();
}
</script>

<style scoped>
.acesso-negado-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f3f4f6;
  font-family: sans-serif;
}
.box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
}
.logo {
  width: 100px;
  margin-bottom: 20px;
}
h1 {
  font-size: 24px;
  font-weight: bold;
  color: #ef4444; /* Vermelho */
  margin-bottom: 10px;
}
p {
  margin-bottom: 20px;
  color: #4b5563;
}
.button-primary, .button-secondary {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}
.button-primary {
  background-color: #3b82f6; /* Azul */
  color: white;
  margin-bottom: 10px;
}
.button-primary:hover {
  background-color: #2563eb;
}
.button-secondary {
  background-color: #e5e7eb; /* Cinza claro */
  color: #374151;
}
.button-secondary:hover {
  background-color: #d1d5db;
}
</style>