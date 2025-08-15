<template>
  <div class="logo-tre">
      <img src="../assets/Ativo 2@4x.png" alt="Logo do TRE">
  </div>
  <div class="login-container">
    <div class="login-box">
      <img src="../assets/logosvg.svg" alt="Logo do Log Fácil">
      <h2>Faça seu login</h2>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <form @submit.prevent="handleLogin">
        <div>
        <CpfInput v-model="cpf">
          <!-- O ícone é passado para dentro do 'slot' do componente -->
          <UserCircleIcon class="icon"/>
        </CpfInput> 
        </div>
        <div class="input-group">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="Senha"
            required
          />
          <EyeIcon v-if="!showPassword" @click="togglePassword" class="icon clickable" />
          <EyeSlashIcon v-else @click="togglePassword" class="icon clickable" />
        </div>
        <button type="submit" class="button-primary" :disabled="isLoading">
          {{ isLoading ? 'Conectando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'; 
import { useRouter } from 'vue-router';
import { loginUsuario } from '../http';
import CpfInput from '@/components/CpfInput.vue';
import { EyeIcon, EyeSlashIcon, UserCircleIcon } from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const router = useRouter();
const cpf = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

function togglePassword() {
  showPassword.value = !showPassword.value;
}

async function handleLogin() {
  if (!cpf.value || !password.value) {
    errorMessage.value = 'Por favor, preencha CPF e senha.';
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';
  try {
    // Chamar a action da store em vez da API diretamente
    // A store agora cuida de tudo: chamada de API, guardar dados e redirecionar.
    await authStore.login({ 
      cpf: cpf.value.replace(/\D/g, ''), // Envia o CPF sem máscara
      password: password.value 
    });
    
    // Se o login for bem-sucedido, a action da store já fará o redirecionamento.
    // Não precisamos fazer mais nada aqui.

  } catch (error: any) {
    // A action da store propaga o erro, então podemos apanhá-lo aqui para mostrar na UI.
    errorMessage.value = error.response?.data?.message || 'Falha no login. Verifique as suas credenciais.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.logo-tre {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
    min-width: 50px;
    min-height: auto;
}
.logo-tre img {
  width: 50%;
  height: auto;
}

.login-container { 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    min-height: 100vh;
    padding: 1rem; /* Adicionado para garantir espaçamento em telas muito pequenas */
    background-color: #f0f2f5;
}
.login-box { 
    background: white; 
    padding: 40px; 
    border-radius: 8px; 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
    text-align: center; 
    width: 100%; 
    max-width: 400px; 
}
.login-box h2 { margin-bottom: 20px; color: #555; font-weight: normal; }
.input-group { display: flex; align-items: center; margin-bottom: 20px; border: 1px solid #ccc; border-radius: 4px; padding: 0 8px; }
.input-group input { flex: 1; border: none; outline: none; padding: 10px; background: transparent; }
.icon { width: 20px; height: 20px; color: #666; }
.clickable { cursor: pointer; }
.button-primary { width: 100%; padding: 12px; background-color: #153462; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; font-weight: 600; }
.button-primary:hover:not(:disabled) { background-color: #112a4f; }
.button-primary:disabled { background-color: #a0aec0; cursor: not-allowed; }
.error-message { color: #dc3545; font-size: 0.9rem; margin-bottom: 15px; }

/* LÓGICA DE RESPONSIVIDADE ADICIONADA AQUI */
@media (max-width: 640px) {
    .login-box {
        padding: 24px;
    }
    .login-box h2 {
        font-size: 1.25rem;
    }
}
</style>