<template>
  <div v-if="visible" class="popup-overlay" @click.self="closePopup">
    <div class="popup-content">
      <h3 class="title">Confirmar Cancelamento</h3>
      <p class="message">Você tem certeza que deseja cancelar a requisição <strong>{{ requisicao?.numero_requisicao }}</strong>?</p>
      <div class="actions">
        <button @click="closePopup" class="button-secondary">Não</button>
        <button @click="confirmAction" class="button-danger">Sim, Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';
import type { IRequisicoes } from '../interfaces/IRequisicoes';

const props = defineProps<{
  visible: boolean;
  requisicao: IRequisicoes | null;
}>();

const emit = defineEmits(['close', 'confirm']);

function closePopup() {
  emit('close');
}

function confirmAction() {
  emit('confirm');
}
</script>

<style scoped>
.popup-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1050; }
.popup-content { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2); width: 100%; max-width: 400px; text-align: center; }
.title { font-size: 1.5em; font-weight: 600; color: #333; margin-bottom: 15px; }
.message { color: #4b5563; margin-bottom: 25px; line-height: 1.6; }
.actions { display: flex; justify-content: center; gap: 15px; }
.button-secondary, .button-danger { padding: 10px 25px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; font-weight: 500; transition: background-color 0.2s; }
.button-secondary { background-color: #e2e8f0; color: #4a5568; }
.button-secondary:hover { background-color: #cbd5e1; }
.button-danger { background-color: #dc3545; color: white; }
.button-danger:hover { background-color: #c82333; }
</style>