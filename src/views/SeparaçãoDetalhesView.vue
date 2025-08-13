<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <Header title="Requisição - Separação" />
    <main class="flex-grow p-4 sm:p-6 lg:p-8">
      <div class="page-container">
        <div class="header-container">
          <h2 class="container-title">Requisição - Separação</h2>
        </div>
        <div class="content-wrapper" v-if="!loading && requisicao">
          <div class="details-section">
            <div><strong>Número:</strong> {{ requisicao.numero_requisicao }}</div>
            <div><strong>Unidade:</strong> {{ requisicao.requisitante_requisicao }}</div>
            <div><strong>Prioridade:</strong> <span :class="{'text-yellow-600 font-bold': requisicao.prioridade_requisicao}">{{ requisicao.prioridade_requisicao ? 'Sim' : 'Não' }}</span></div>
            <div><strong>Tipo de Envio:</strong> {{ requisicao.tipo_envio?.descricao_tipo_envio_requisicao || 'Não definido' }}</div>
          </div>
          <h3 class="items-title">Itens para Separação</h3>
          <div class="table-container responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Endereço</th>
                  <th>Material</th>
                  <th>Qtd. Solicitada</th>
                  <th>Qtd. Atendida</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in requisicao.itens" :key="item.id_item_requisicao">
                  <td data-label="Endereço">{{ item.endereco_item_requisicao }}</td>
                  <td data-label="Material">{{ item.descricao_material_item_requisicao }}</td>
                  <td data-label="Qtd. Solicitada">{{ item.quantidade_solicitada_item_requisicao }}</td>
                  <td data-label="Qtd. Atendida">
                    <input
                      type="number" 
                      class="input-qty"
                      v-model.number="item.quantidade_atendida_item_requisicao"
                      :max="item.quantidade_solicitada_item_requisicao"
                      placeholder="0"
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-if="loading" class="loading-message">Carregando detalhes da separação...</div>
        <footer class="footer-actions">
            <button @click="goBack" class="button-secondary">Voltar</button>
            <button @click="efetivarSeparacao" class="button-primary" :disabled="isSaving">
                {{ isSaving ? 'Aguarde...' : 'Efetivar Separação' }}
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
    if (requisicao.value) {
        requisicao.value.itens.forEach(item => {
            item.quantidade_atendida_item_requisicao = null;
        });
    }
  } catch (error) {
    console.error("Erro", error);
    showNotification('Erro', "Não foi possível carregar os dados da requisição.");
  } finally {
    loading.value = false;
  }
});

async function efetivarSeparacao() {
  if (!requisicao.value) return;
  isSaving.value = true;
  try {
    const dadosParaAtualizar = {
      status: 'enviado-para-conferencia-separacao',
      itens: requisicao.value.itens.map(item => ({
        id_item_requisicao: item.id_item_requisicao,
        quantidade_atendida_item_requisicao: item.quantidade_atendida_item_requisicao || 0
      }))
    };
    await atualizarRequisicao(requisicao.value.id_requisicao, dadosParaAtualizar);
    
    acaoConcluida.title = 'Separação Efetivada!';
    acaoConcluida.message = 'A requisição foi enviada com sucesso para a próxima etapa de conferência.';
    acaoConcluida.visible = true;

  } catch (error) {
    console.error("Erro", error);
    showNotification('Erro', "Não foi possível efetivar a separação.");
  } finally {
    isSaving.value = false;
  }
}

// FUNÇÃO ATUALIZADA
function goBack() {
  router.push({ name: 'Separacao' }); // Volta para a nova tela de lista
}
</script>

<style scoped>
/* Estilos existentes */
.page-container { width: 100%; display: flex; flex-direction: column; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.header-container { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
.container-title { font-weight: bold; font-size: 1.5em; color: #153462; }
.content-wrapper { flex-grow: 1; overflow-y: auto; }
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
.input-qty { width: 80px; padding: 5px; border-radius: 5px; border: 1px solid #ccc; text-align: right; }
.loading-message { text-align: center; padding: 40px; color: #6c757d; }
.footer-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 20px; border-top: 1px solid #eee; }
.button-primary, .button-secondary { padding: 10px 25px; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; font-weight: 500; }
.button-primary { background-color: #153462; color: white; }
.button-secondary { background-color: #6c757d; color: white; }
.button-primary:disabled { background-color: #a0aec0; cursor: not-allowed; }
.text-yellow-600 { color: #D97706; }

/* Responsividade */
@media (max-width: 768px) {
    .responsive-table thead { display: none; }
    .responsive-table tr { display: block; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .responsive-table td { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; text-align: right; border-bottom: 1px solid #eee; }
    .responsive-table td:last-child { border-bottom: none; }
    .responsive-table td::before { content: attr(data-label); font-weight: 600; text-align: left; margin-right: 1rem; color: #374151; }
    .details-section { grid-template-columns: 1fr; }
}
</style>