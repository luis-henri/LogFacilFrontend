<template>
      <div class="page-container">
        <div class="content-container">
          <div class="import-box">
          <Header />
        <h2 class="title">Importação de Requisições</h2>
        <p class="subtitle">Selecione o arquivo .txt para importar os dados para o sistema.</p>

        <div v-if="feedbackMessage" :class="['feedback-message', isError ? 'feedback-error' : 'feedback-success']">
          {{ feedbackMessage }}
        </div>

        <input type="file" ref="fileInput" @change="handleFileSelected" accept=".txt" class="hidden-input">

        <button @click="triggerFileInput" class="button-select" :disabled="isLoading">
          <ArrowUpTrayIcon class="icon" />
          <span>Selecionar arquivo</span>
        </button>

        <p v-if="fileName" class="file-name">Arquivo selecionado: <strong>{{ fileName }}</strong></p>

        <hr class="divider">

        <button @click="handleImport" :disabled="!selectedFile || isLoading" class="button-import">
          <span v-if="isLoading">Importando...</span>
          <span v-else>Confirmar Importação</span>
        </button>

        <button @click="goToRequisicoes" class="button-tertiary" :disabled="isLoading">
          Ir para Requisições
        </button>
      </div>
    </div>
    </div>
</template>

<script lang="ts" setup>
import Header from '@/components/Header.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowUpTrayIcon } from '@heroicons/vue/24/outline';
import { importarRequisicoes } from '../http';

const router = useRouter();
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const fileName = ref('');

const isLoading = ref(false);
const feedbackMessage = ref('');
const isError = ref(false);

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileSelected(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
    fileName.value = selectedFile.value.name;
    feedbackMessage.value = '';
    isError.value = false;
  }
}

async function handleImport() {
  if (!selectedFile.value) {
    feedbackMessage.value = 'Por favor, selecione um arquivo primeiro.';
    isError.value = true;
    return;
  }

  isLoading.value = true;
  feedbackMessage.value = '';
  isError.value = false;

  try {
    const response = await importarRequisicoes(selectedFile.value);
    feedbackMessage.value = response.message || 'Importação bem-sucedida!';
    isError.value = false;

    setTimeout(() => {
      router.push({ name: 'Requisicao' });
    }, 2000);

  } catch (error: any) {
    feedbackMessage.value = error.message || 'Ocorreu um erro durante a importação.';
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
}

function goToRequisicoes() {
  router.push({ name: 'Requisicao' });
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* ocupa toda a tela */
}
.content-container {
  flex: 1;                       /* ocupa o espaço restante */
  display: flex;
  align-items: center;           /* centraliza verticalmente */
  justify-content: center;       /* centraliza horizontalmente */
  padding: 1rem;                 /* espaçamento responsivo */
}
.import-box {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 600px;              /* tamanho máximo */
  text-align: center;
  /* pequeno deslocamento para ficar "um pouco mais para baixo" */
  transform: translateY(6vh);    /* desloca para baixo 6% da altura da viewport */
}
.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 24px;
}

.hidden-input {
  display: none;
}

.button-select {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.button-select:hover:not(:disabled) {
  background-color: #2563eb;
}

.icon {
  width: 20px;
  height: 20px;
}

.file-name {
  margin-top: 16px;
  font-size: 0.9rem;
  color: #4b5563;
  word-break: break-all;
  /* Garante que nomes de arquivo longos não quebrem o layout */
}

.divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 24px 0;
}

.button-import {
  width: 100%;
  padding: 12px;
  background-color: #16a34a;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.2s;
  margin-bottom: 1rem;
}

.button-import:hover:not(:disabled) {
  background-color: #15803d;
}

.button-import:disabled,
.button-select:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.feedback-message {
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 8px;
  font-weight: 500;
}

.feedback-success {
  background-color: #dcfce7;
  color: #166534;
}

.feedback-error {
  background-color: #fee2e2;
  color: #991b1b;
}

.button-tertiary {
  width: 100%;
  padding: 12px;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.button-tertiary:hover:not(:disabled) {
  background-color: #4b5563;
}

.button-tertiary:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

/* LÓGICA DE RESPONSIVIDADE ADICIONADA AQUI */
@media (max-width: 640px) {
  .import-box {
    transform: translateY(3vh);
    padding: 1.25rem;
    max-width: 92%;
  }

  .title {
    font-size: 1.25rem;
  }

  .subtitle {
    font-size: 0.9rem;
    margin-bottom: 16px;
  }

  .button-select,
  .button-import,
  .button-tertiary {
    font-size: 0.9rem;
    padding: 10px 16px;
  }
}
@media (min-width: 1024px) {
  .import-box {
    max-width: 540px;
    transform: translateY(6vh);
  }
}
</style>
