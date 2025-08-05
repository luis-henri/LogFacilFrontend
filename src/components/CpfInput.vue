<template>
  <div>
    <!-- Este div agora é o container com a borda, imitando o input de senha -->
    <div class="input-group" :class="{ 'error-border': !!errorMessage }">
      <input
        id="cpf"
        type="text"
        v-model="model"
        @blur="validate"
        maxlength="14"
        placeholder="CPF"
        class="input-field"
      />
      <!-- O ícone que for passado da página de Login aparecerá aqui -->
      <slot></slot>
    </div>
    <!-- A mensagem de erro fica do lado de fora para não quebrar o layout -->
    <p v-if="errorMessage" class="error-message-text">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { isValidCpf } from '@/utils/validators'; // Supondo que você tenha este arquivo em src/utils/

const model = defineModel<string | null>();
const errorMessage = ref<string | null>(null);

// Aplica a máscara de CPF manualmente enquanto o usuário digita
watch(model, (newValue) => {
  if (!newValue) return;
  const digits = newValue.replace(/\D/g, '');
  let maskedValue = digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  
  if (maskedValue !== newValue) {
    model.value = maskedValue;
  }
});

// Valida o CPF quando o usuário sai do campo
const validate = () => {
  if (!model.value) {
    errorMessage.value = null;
    return;
  }
  if (!isValidCpf(model.value)) {
    errorMessage.value = 'Por favor, insira um CPF válido.';
  } else {
    errorMessage.value = null;
  }
};
</script>

<style scoped>
.input-group {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0 8px;
  margin-bottom: 20px; /* Mantém o espaçamento original */
  transition: border-color 0.2s;
}

/* Adiciona um brilho azul quando o campo está em foco */
.input-group:focus-within {
  border-color: #153462; 
}

/* Estilo para o campo de input, que agora não tem borda */
.input-field {
  flex: 1;
  border: none;
  outline: none;
  padding: 10px;
  background: transparent;
  width: 100%;
}
.error-border {
  border-color: #dc3545;
}

/* Estilo para o texto da mensagem de erro */
.error-message-text {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: -16px; /* Sobe a mensagem para ficar logo abaixo do campo */
  margin-bottom: 16px;
  text-align: left;
}
</style>