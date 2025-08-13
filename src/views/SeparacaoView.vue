<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <Header />
    <main class="flex-grow p-4 sm:p-6 lg:p-8">
      <div class="page-container">
        <div class="header-container">
          <h2 class="container-title">Requisições - Separação</h2>
        </div>
        <div class="table-scroll-container">
          <div class="table-container responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Data/Hora</th>
                  <th>Unidade</th>
                  <th>Prioridade - Envio</th>
                  <th class="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="4" class="text-center py-10 text-gray-500">Carregando requisições...</td>
                </tr>
                <tr v-else-if="requisicoes.length === 0">
                  <td colspan="4" class="text-center py-10 text-gray-500">Nenhuma requisição aguardando separação.</td>
                </tr>
                <tr v-for="req in requisicoes" :key="req.id_requisicao">
                  <td data-label="Número">{{ req.numero_requisicao }}</td>
                  <td data-label="Data/Hora">{{ new Date(req.data_requisicao).toLocaleString('pt-BR') }}</td>
                  <td data-label="Unidade">{{ req.requisitante_requisicao }}</td>
                  <td data-label="Envio">
                    <div class="envio-cell">
                      <ArrowUpCircleIcon v-if="req.prioridade_requisicao" class="icon-prioridade-ativa" title="Prioritário" />
                      <span>{{ req.tipo_envio?.descricao_tipo_envio_requisicao || '-' }}</span>
                    </div>
                  </td>
                  <td data-label="Ações" class="text-center">
                    <button @click="iniciarSeparacao(req)" class="button-primary text-xs">
                      iniciar Separação
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
    <NotificationPopUp 
        :visible="notification.visible"
        :title="notification.title"
        :message="notification.message"
        @close="closeNotification"/>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import { obterRequisicoesPorStatus, atualizarRequisicao } from '../http';
import type { IRequisicoes } from '../interfaces/IRequisicoes';
import { ArrowUpCircleIcon } from '@heroicons/vue/24/outline';
import NotificationPopUp from '@/components/NotificationPopUp.vue';

const router = useRouter();
const requisicoes = ref<IRequisicoes[]>([]);
const loading = ref(true);

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

onMounted(async () => {
  try {
    requisicoes.value = await obterRequisicoesPorStatus('enviado-para-separacao');
  } catch (error) {
    console.error("Erro ao buscar requisições para separação:", error);
  } finally {
    loading.value = false;
  }
});

async function iniciarSeparacao(req: IRequisicoes) {
  try {
  // Navega para a tela de detalhes da separação
  await atualizarRequisicao(req.id_requisicao, { status: 'em-separacao' });
  router.push({ name: 'SeparacaoDetalhes', params: { id: req.id_requisicao } });
  }catch (error) {
    console.error("Erro ao iniciar separação:", error);
    showNotification('Erro', "Não foi possível iniciar a separação");
  }
}
</script>

<style scoped>
/* Estilos consistentes com as outras telas de lista */
.page-container { width: 100%; display: flex; flex-direction: column; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.table-scroll-container {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: auto; 
  border: 1px solid #e9ecef;
  border-radius: 8;
  min-height: 0;
  max-height: 60vh;
  position: relative;
}
.table-scroll-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
.header-container { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
.container-title { font-weight: bold; font-size: 1.5em; color: #153462; }
.content-wrapper { flex-grow: 1; overflow-y: auto; }
.table-container { border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
thead { background-color: #f8f9fa; }
th { font-weight: 600; color: #495057; }
.button-primary { padding: 8px 12px; background-color: #153462; color: white; border-radius: 5px; border: none; cursor: pointer; }
.text-center { text-align: center; }
.envio-cell { display: flex; align-items: center; gap: 8px; }
.icon-prioridade-ativa { width: 20px; height: 20px; color: #f59e0b; }

/* Responsividade */
@media (max-width: 768px) {
  .responsive-table thead { display: none; }
  .responsive-table tr { display: block; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  .responsive-table td { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; text-align: right; border-bottom: 1px solid #eee; }
  .responsive-table td:last-child { border-bottom: none; }
  .responsive-table td::before { content: attr(data-label); font-weight: 600; text-align: left; margin-right: 1rem; color: #374151; }
}
</style>