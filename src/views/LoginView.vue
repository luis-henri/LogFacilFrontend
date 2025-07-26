<template>
  <div class="login-container">
    <div class="login-box">
      <img src="../assets/logosvg.svg" alt="Logo do Log Fácil">
      <h2>Faça seu login</h2>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <input
            type="text"
            inputmode="numeric"
            v-model="cpf"
            placeholder="CPF" 
            maxlength="14"
            required
            />
            <UserCircleIcon class="icon"/>
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
          {{ isLoading ? 'A entrar...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router';
import { loginUsuario } from '../http';

const router = useRouter();
const cpf = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

watch(cpf, (newValue) => {
  const digits = newValue.replace(/\D/g, '');
  let maskedValue = digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  if (maskedValue.length > 14) maskedValue = maskedValue.slice(0, 14);
  cpf.value = maskedValue;
});

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
    const response: any = await loginUsuario({ 
      cpf: cpf.value.replace(/\D/g, ''),
      password: password.value 
    });
    
    if (response.token) {
        localStorage.setItem('user-token', response.token);
        router.push({ name: 'Importacao' });
    } else {
        throw new Error('Resposta inválida do servidor.');
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Falha no login. Verifique as suas credenciais.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
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
