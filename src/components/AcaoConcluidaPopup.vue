<template>
  <div v-if="visible" class="popup-overlay">
    <div class="box">
      <img src="../assets/logosvg.svg" alt="Logo" class="logo">
      
      <!-- Ícone de Sucesso -->
      <CheckCircleIcon class="success-icon" />

      <h1>{{ title }}</h1>
      <p>{{ message }}</p>
      
      <button @click="irParaInicio" class="button-primary">
        Ir para minha página inicial
      </button>
      <button @click="fazerLogout" class="button-secondary">
        Sair (fazer logout)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { CheckCircleIcon } from '@heroicons/vue/24/solid';

// Este componente aceita 'visible', 'title', e 'message' como propriedades
defineProps<{
  visible: boolean;
  title: string;
  message: string;
}>();

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
      router.push({ name: 'Importacao' });
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
      authStore.logout();
      break;
  }
}

function fazerLogout() {
  authStore.logout();
}
</script>

<style scoped>
/* Estilo para o fundo escurecido */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Estilos copiados e adaptados da sua tela de Acesso Negado */
.box {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 90%;
}
.logo {
  width: 100px;
  margin-bottom: 15px;
}
.success-icon {
    width: 60px;
    height: 60px;
    color: #22c55e; /* Verde Sucesso */
    margin: 0 auto 15px auto;
}
h1 {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 10px;
}
p {
  margin-bottom: 25px;
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
  background-color: #3b82f6;
  color: white;
  margin-bottom: 10px;
}
.button-primary:hover {
  background-color: #2563eb;
}
.button-secondary {
  background-color: #e5e7eb;
  color: #374151;
}
.button-secondary:hover {
  background-color: #d1d5db;
}
</style>