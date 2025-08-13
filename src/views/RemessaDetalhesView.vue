<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <Header title="Requisição - Expedição" />
      <main class="flex-grow p-4 sm:p-6 lg:p-8">
        <div class="page-container">
          <div class="header-container">
            <h2 class="container-title">Requisição - Expedição</h2>
          </div>
    <div class="content-wrapper" v-if="!loading && requisicao">
      <div class="details-section">
        <div><strong>Número:</strong> {{ requisicao.numero_requisicao }}</div>
        <div><strong>Unidade:</strong> {{ requisicao.requisitante_requisicao }}</div>
        <div><strong>Prioridade:</strong> <span :class="{'text-yellow-600 font-bold': requisicao.prioridade_requisicao}">{{ requisicao.prioridade_requisicao ? 'Sim' : 'Não' }}</span></div>
        <div><strong>Tipo de Envio:</strong> {{ requisicao.tipo_envio?.descricao_tipo_envio_requisicao || 'Não definido' }}</div>
      </div>

      <h3 class="items-title">Medidas do Pacote</h3>
      <div v-if="!requisicao.volumes || requisicao.volumes.length === 0" class="no-data-message">
        Nenhum volume registado para esta requisição.
      </div>
      <div v-else class="table-container">
        <!-- CLASSE ADICIONADA AQUI -->
        <table class="responsive-table">
          <thead>
            <tr>
              <th>Volume</th>
              <th>Comprimento</th>
              <th>Largura</th>
              <th>Altura</th>
              <th>Peso</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(volume, index) in requisicao.volumes" :key="index">
              <!-- ATRIBUTOS ADICIONADOS AQUI -->
              <td data-label="Volume">{{ index + 1 }}</td>
              <td data-label="Comprimento">{{ volume.comprimento }} cm</td>
              <td data-label="Largura">{{ volume.largura }} cm</td>
              <td data-label="Altura">{{ volume.altura }} cm</td>
              <td data-label="Peso">{{ volume.peso }} kg</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="loading" class="loading-message">Carregando detalhes da remessa...</div>
    
    <footer class="footer-actions">
        <button @click="goBack" class="button-secondary">Voltar</button>
        <button @click="finalizarRequisicao" class="button-primary" :disabled="isSaving">
            {{ isSaving ? 'Aguarde...' : 'Finalizar Remessa' }}
        </button>
    </footer>
    </div>
    </main>
    <NotificationPopUp
        :visible="notification.visible"
        :title="notification.title"
        :message="notification.message"
        @close="closeNotification"
    />
    <AcaoConcluidaPopup
      :visible="acaoConcluida.visible"
      :title="acaoConcluida.title"
      :message="acaoConcluida.message"
    />
  </div>
</template>

<script lang="ts" setup>
// O script permanece o mesmo
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import { obterRequisicaoPorId, atualizarRequisicao } from '../http';
import type { IRequisicoes } from '../interfaces/IRequisicoes';
import NotificationPopUp from '@/components/NotificationPopUp.vue';
import AcaoConcluidaPopup from '@/components/AcaoConcluidaPopup.vue';

const route = useRoute();
const router = useRouter();
const requisicao = ref<IRequisicoes | null>(null);
const loading = ref(true);
const isSaving = ref(false);

const notification = reactive({
    visible: false,
    title: '',
    message: ''
});

function showNotification(title: string, message: string){
    notification.title = title;
    notification.message = message;
    notification.visible = true;
}

function closeNotification() {
    notification.visible = false;
}

const acaoConcluida = reactive({
  visible: false,
  title: '',
  message: '',
});

onMounted(async () => {
  const requisicaoId = route.params.id as string;
  try {
    requisicao.value = await obterRequisicaoPorId(requisicaoId);
  } catch (error) {
    console.error("Erro ao buscar dados da requisição para remessa:", error);
    showNotification('Erro', "Não foi possível carregar os dados da requisição.");
  } finally {
    loading.value = false;
  }
});

async function finalizarRequisicao() {
  if (!requisicao.value) return;
  isSaving.value = true;
  try {
    await atualizarRequisicao(requisicao.value.id_requisicao, { status: 'concluida' });
    showNotification('Sucesso',`Requisição ${requisicao.value.numero_requisicao} finalizada com sucesso!`);
    
    acaoConcluida.title = 'Requisição Finalizada!';
    acaoConcluida.message = 'A requisição foi finalizada com sucesso.';
    acaoConcluida.visible = true;

  } catch (error) {
    console.error("Erro ao finalizar requisição:", error);
    showNotification('Erro',"Não foi possível finalizar a requisição.");
  } finally {
    isSaving.value = false;
  }
}

function goBack() {
  router.push({ name: 'Remessa' });
}
</script>

<style scoped>
/* Estilos existentes */
.page-container { width: 100%; overflow-x: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); }
.header-container { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
.container-title { font-weight: bold; font-size: 1.5em; color: #153462; }
.content-wrapper { flex-grow: 1; padding: 20px; overflow-y: auto; }
.details-section { 
  margin-bottom: 20px; 
  font-size: 0.9rem; 
  color: #333; 
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
}
.items-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 10px; color: #153462; }
.table-container { border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
thead { background-color: #f8f9fa; }
th { font-weight: 600; color: #495057; }
.loading-message, .no-data-message { text-align: center; padding: 40px; color: #6c757d; }
.footer-actions { display: flex; justify-content: flex-end; gap: 10px; padding: 20px; border-top: 1px solid #eee; background-color: #fff; }
.button-primary, .button-secondary { padding: 10px 25px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; font-weight: 500; }
.button-primary { background-color: #153462; color: white; }
.button-secondary { background-color: #6c757d; color: white; }
.button-primary:disabled { background-color: #a0aec0; cursor: not-allowed; }
.text-yellow-600 { color: #D97706; }

/* LÓGICA DE RESPONSIVIDADE ADICIONADA AQUI */
@media (max-width: 768px) {
  .responsive-table thead {
    display: none;
  }
  .responsive-table tr {
    display: block;
    border-bottom: 1px solid #eee;
    padding: 1rem 0;
  }
   .responsive-table tr:last-child {
    border-bottom: none;
  }
  .responsive-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    text-align: right;
    border-bottom: none;
  }
  .responsive-table td::before {
    content: attr(data-label);
    font-weight: 600;
    text-align: left;
    margin-right: 1rem;
    color: #495057;
  }
  .details-section {
    grid-template-columns: 1fr;
  }
  .footer-actions {
      flex-direction: column;
  }
  .button-primary, .button-secondary {
      width: 100%;
  }
}
</style>
