<template>
  <div v-if="visible" class="popup-overlay" @click.self="closePopup">
    <div class="popup-content">
      <h3 class="title">Selecionar Tipo de Envio</h3>
      
      <!-- Estado de Carregamento -->
      <div v-if="!tiposEnvio || tiposEnvio.length === 0" class="loading-state">
        Carregando opções de envio...
      </div>

      <!-- Lista de Opções -->
      <div v-else class="options-container">
        <!-- Opção para usar o padrão (Normal PAC) -->
        <div class="radio-item">
          <input 
            type="radio" 
            id="envio-padrao" 
            :value="null" 
            v-model="selecaoInterna"
          >
          <label for="envio-padrao">
            Normal (PAC)
          </label>
        </div>
        
        <!-- Opções de tipos de envio -->
        <div v-for="tipo in tiposEnvio" :key="tipo.id_tipo_envio_requisicao" class="radio-item">
          <input 
            type="radio" 
            :id="'envio-' + tipo.id_tipo_envio_requisicao" 
            :value="tipo.id_tipo_envio_requisicao" 
            v-model="selecaoInterna"
          >
          <label :for="'envio-' + tipo.id_tipo_envio_requisicao">
            {{ tipo.descricao_tipo_envio_requisicao }}
          </label>
        </div>
      </div>

      <div class="actions">
        <button @click="closePopup" class="button-secondary">Cancelar</button>
        <button @click="confirmAction" class="button-confirm">Confirmar</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps<{
  visible: boolean;
  tiposEnvio: any[]; // Array com os tipos de envio vindos da API
  selecaoAtual: number | null; // ID do tipo de envio já selecionado
}>();

const emit = defineEmits(['close', 'submit']);

const selecaoInterna = ref<number | null>(null);

// Quando o popup se torna visível, atualiza a seleção interna
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    selecaoInterna.value = props.selecaoAtual || 4; // 4 é o ID do envio padrão (Normal PAC)
  }
});

function closePopup() {
  emit('close');
}

function confirmAction() {
  if (selecaoInterna.value) {
    emit('submit', selecaoInterna.value);
  }
}
</script>

<style scoped>
.popup-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050; }
.popup-content { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2); width: 100%; max-width: 400px; text-align: center; }
.title { font-size: 1.5em; font-weight: 600; color: #333; margin-bottom: 25px; }
.loading-state { color: #6c757d; font-style: italic; padding: 20px 0; }
.options-container { display: flex; flex-direction: column; align-items: flex-start; gap: 15px; margin-bottom: 25px; }
.radio-item { display: flex; align-items: center; gap: 10px; }
.radio-item input[type="radio"] { width: 18px; height: 18px; accent-color: #153462; cursor: pointer; }
.radio-item label { font-size: 1em; color: #4b5563; cursor: pointer; }
.actions { display: flex; justify-content: center; gap: 15px; }
.button-secondary, .button-confirm { padding: 10px 25px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; font-weight: 500; transition: background-color 0.2s; }
.button-secondary { background-color: #e2e8f0; color: #4a5568; }
.button-secondary:hover { background-color: #cbd5e1; }
.button-confirm { background-color: #153462; color: white; }
.button-confirm:hover { background-color: #112a4f; }
.button-confirm:disabled { background-color: #a0aec0; cursor: not-allowed; }
</style>