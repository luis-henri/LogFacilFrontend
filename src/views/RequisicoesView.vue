<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <Header />
    <main class="flex-grow p-4 sm:p-6 lg:p-8">
      <div class="page-container">
        <div class="header-container">
          <div class="header-left">
            <div class="user-info-wrapper">
              <div class="user-info" @click="toggleDropdown">
                <UserCircleIcon class="user-icon"/>
                <span class="user-name">{{ userName }}</span>
              </div>
              <div v-if="isDropdownOpen" class="dropdown-menu">
                <button @click="handleLogout" class="dropdown-item">Sair</button>
              </div>
            </div>
            <h2 class="container-title">Requisições - Atendimento</h2>
          </div>
          <button @click="goToImportacao" class="button-secondary-nav">Voltar para Importação</button>
        </div>

        <div class="table-scroll-container">
          <div v-if="loading" class="loading-message">Carregando requisições...</div>
          <!-- A classe 'responsive-table' foi adicionada aqui -->
          <table v-else class="responsive-table">
            <thead>
              <tr>
                <th><input type="checkbox" v-model="allSelected" @change="toggleSelectAll" /></th>
                <th>Data/Hora</th>
                <th>UR</th>
                <th>Número</th>
                <th>Situação</th>
                <th>Observação</th>
                <th>Prior - Envio</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody v-if="!loading">
              <tr v-if="requisicoes.length === 0">
                <td colspan="8" class="no-data-message">Nenhuma requisição encontrada.</td>
              </tr>
              <tr v-for="req in sortedRequisicoes" :key="req.id_requisicao" :class="{ 'row-checked': req.checked }" @click="toggleRowSelection(req)">
                <!-- Os atributos 'data-label' foram adicionados a cada célula -->
                <td data-label="Selecionar"><input type="checkbox" v-model="req.checked" @click.stop /></td>
                <td data-label="Data/Hora">{{ new Date(req.data_requisicao).toLocaleString('pt-BR') }}</td>
                <td data-label="UR">{{ req.requisitante_requisicao }}</td>
                <td data-label="Número">{{ req.numero_requisicao }}</td>
                <td data-label="Situação">
                  <span :class="['status-badge', getStatusClass(req.situacao.descricao_situacao_requisicao)]">
                    {{ req.situacao.descricao_situacao_requisicao }}
                  </span>
                </td>
                <td data-label="Observação">{{ req.observacao_requisicao || '-' }}</td>
                <td data-label="Envio">
                  <div class="envio-cell">
                    <ArrowUpCircleIcon 
                      @click.stop="handleTogglePrioridade(req)" 
                      :class="['icon-acao-prioridade', { 'icon-prioridade-ativa': req.prioridade_requisicao }]" 
                      title="Alternar Prioridade" 
                    />
                    <span v-if="req.tipo_envio" class="text-xs font-semibold">{{ req.tipo_envio.descricao_tipo_envio_requisicao }}</span>
                    <TruckIcon v-else @click.stop="openSelecionarEnvioPopup(req)" class="icon-acao" title="Selecionar Tipo de Envio" />
                  </div>
                </td>
                <td data-label="Ações">
                  <div class="acoes-cell">
                    <EyeIcon @click.stop="openVisualizarItensPopup(req)" class="icon-acao" title="Visualizar Itens" />
                    <TrashIcon @click.stop="openCancelarPopup(req)" class="icon-acao icon-cancelar" title="Cancelar Requisição" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <footer class="footer-actions">
            <button 
                @click="iniciarSeparacaoEmMassa" 
                class="button-primary"
                :disabled="!temRequisicoesSelecionadas || isSaving"
            >
                {{ isSaving ? 'Aguarde...' : 'Enviar para Separação' }}
            </button>
        </footer>
      </div>
    </main>

    <!-- Popups -->
    <PopUp
      :visible="showEnvioPopup"
      :tipos-envio="tiposEnvio"
      :selecao-atual="requisicaoSelecionada?.id_tipo_envio_requisicao ?? null"
      @close="closeSelecionarEnvioPopup"
      @submit="handleEnvioConfirm"
    />
    
    <VisualizarItensPopup 
      :visible="showItensPopup" 
      :requisicao="requisicaoSelecionada" 
      @close="closeVisualizarItensPopup" 
    />

    <ConfirmarCancelamentoPopup 
        :visible="showCancelarPopup" 
        :requisicao="requisicaoSelecionada" 
        @close="closeCancelarPopup" 
        @confirm="handleCancelarConfirm" 
    />

    <NotificationPopUp
        :visible="notification.visible"
        :title="notification.title"
        :message="notification.message"
        @close="closeNotification"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { UserCircleIcon, TruckIcon, EyeIcon, TrashIcon, ArrowUpCircleIcon } from '@heroicons/vue/24/outline';
import Header from '../components/Header.vue';
import PopUp from '../components/PopUp.vue';
import VisualizarItensPopup from '../components/VisualizarItensPopup.vue';
import ConfirmarCancelamentoPopup from '../components/ConfirmarCancelamentoPopup.vue';
import NotificationPopUp from '@/components/NotificationPopUp.vue';
import { obterRequisicoesPorStatus, atualizarRequisicao, obterTiposEnvio } from '../http/index';
import type { IRequisicoes } from '../interfaces/IRequisicoes';

const router = useRouter();
const requisicoes = ref<IRequisicoes[]>([]);
const loading = ref(true);
const isSaving = ref(false);
const userName = ref('Usuário');
const isDropdownOpen = ref(false);

const showEnvioPopup = ref(false);
const showItensPopup = ref(false);
const showCancelarPopup = ref(false);
const requisicaoSelecionada = ref<IRequisicoes | null>(null);
const tiposEnvio = ref<any[]>([]);

// NOVO ESTADO PARA O POPUP DE NOTIFICAÇÃO
const notification = reactive({
    visible: false,
    title: '',
    message: ''
});

// NOVA FUNÇÃO PARA EXIBIR O POPUP
function showNotification(title: string, message: string) {
    notification.title = title;
    notification.message = message;
    notification.visible = true;
}

function closeNotification() {
    notification.visible = false;
}


const sortedRequisicoes = computed(() => {
  return [...requisicoes.value].sort((a, b) => {
    if (a.prioridade_requisicao && !b.prioridade_requisicao) return -1;
    if (!a.prioridade_requisicao && b.prioridade_requisicao) return 1;
    return 0;
  });
});

const temRequisicoesSelecionadas = computed(() => {
    return requisicoes.value.some(req => req.checked);
});

onMounted(async () => {
  const token = localStorage.getItem('user-token');
  if (token) {
      try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userName.value = payload.nome || 'Usuário'; 
      } catch (e) {
          userName.value = 'Usuário';
      }
  }
  await carregarDados();
  await carregarTiposEnvio();
});

async function carregarDados() {
  loading.value = true;
  try {
    const dadosApi = await obterRequisicoesPorStatus('pendente');
    requisicoes.value = dadosApi.map(req => ({ ...req, checked: false }));
  } catch (error: any) {
    alert(`Erro ao buscar dados: ${error.message}`);
  } finally {
    loading.value = false;
  }
}

async function carregarTiposEnvio() {
    try {
        tiposEnvio.value = await obterTiposEnvio();
    } catch (error) {
        console.error("Erro ao carregar tipos de envio:", error);
    }
}

const allSelected = computed({
  get: () => requisicoes.value.length > 0 && requisicoes.value.every(item => item.checked),
  set: (value: boolean) => { requisicoes.value.forEach(item => { item.checked = value; }); }
});

function toggleSelectAll(event: Event) {
  const target = event.target as HTMLInputElement;
  requisicoes.value.forEach(item => { item.checked = target.checked; });
}

function toggleRowSelection(req: IRequisicoes) { req.checked = !req.checked; }


async function iniciarSeparacaoEmMassa() {
    const selecionadas = requisicoes.value.filter(req => req.checked);
    if (selecionadas.length === 0) {
        showNotification('Atenção', "Por favor, selecione pelo menos uma requisição para iniciar a separação.");
        return;
    }
    
    isSaving.value = true;
    try {
        const promessas = selecionadas.map(req => 
            atualizarRequisicao(req.id_requisicao, { status: 'em-separacao' })
        );
        await Promise.all(promessas);
        await carregarDados();
        showNotification('Sucesso', `${selecionadas.length} requisição(ões) enviada(s) para separação.`);
    } catch (error) {
        console.error("Erro ao iniciar separação em massa:", error);
        showNotification('Erro', "Ocorreu um erro ao enviar as requisições para separação.");
    } finally {
        isSaving.value = false;
    }
}
async function handleTogglePrioridade(req: IRequisicoes) {
    const index = requisicoes.value.findIndex(r => r.id_requisicao === req.id_requisicao);
    if (index !== -1) {
        const novoStatusPrioridade = !requisicoes.value[index].prioridade_requisicao;
        try {
            await atualizarRequisicao(req.id_requisicao, { prioridade_requisicao: novoStatusPrioridade });
            requisicoes.value[index].prioridade_requisicao = novoStatusPrioridade;
        } catch (error) {
            console.error("Erro ao atualizar prioridade:", error);
              showNotification('Erro',"Não foi possível alterar a prioridade.");
        }
    }
}

function openSelecionarEnvioPopup(req: IRequisicoes) {
  requisicaoSelecionada.value = req;
  showEnvioPopup.value = true;
}

function closeSelecionarEnvioPopup() {
  showEnvioPopup.value = false;
}

async function handleEnvioConfirm(tipoEnvioId: number) {
    if (!requisicaoSelecionada.value || !tipoEnvioId) {
        closeSelecionarEnvioPopup();
        return;
    };

    try {
        const updatedReq = await atualizarRequisicao(requisicaoSelecionada.value.id_requisicao, { id_tipo_envio_requisicao: tipoEnvioId });
        const index = requisicoes.value.findIndex(r => r.id_requisicao === requisicaoSelecionada.value!.id_requisicao);
        if (index !== -1) {
            requisicoes.value[index].tipo_envio = updatedReq.tipo_envio;
        }
    } catch (error) {
        console.error("Erro ao atualizar tipo de envio:", error);
        alert("Falha ao guardar o tipo de envio.");
    } finally {
        closeSelecionarEnvioPopup();
    }
}

function openVisualizarItensPopup(req: IRequisicoes) {
  requisicaoSelecionada.value = req;
  showItensPopup.value = true;
}
function closeVisualizarItensPopup() { showItensPopup.value = false; }

function openCancelarPopup(req: IRequisicoes) {
  requisicaoSelecionada.value = req;
  showCancelarPopup.value = true;
}
function closeCancelarPopup() { showCancelarPopup.value = false; }
async function handleCancelarConfirm() {
  if (requisicaoSelecionada.value) {
    try {
      await atualizarRequisicao(requisicaoSelecionada.value.id_requisicao, { status: 'cancelada' });
      requisicoes.value = requisicoes.value.filter(
        r => r.id_requisicao !== requisicaoSelecionada.value?.id_requisicao
      );
      showNotification('Sucesso', `Requisição ${requisicaoSelecionada.value.numero_requisicao} cancelada com sucesso.`);
    } catch (error: any) {
      showNotification('Erro', `Erro ao cancelar requisição: ${error.message}`);
    } finally {
      closeCancelarPopup();
    }
  }
}

function toggleDropdown() { isDropdownOpen.value = !isDropdownOpen.value; }
function handleLogout() {
  localStorage.removeItem('user-token');
  router.push({ name: 'Login' });
}
function goToImportacao() {
    router.push({ name: 'Importacao' });
}
function getStatusClass(situacao: string): string {
  if (!situacao) return '';
  const statusNormalizado = situacao.toLowerCase().replace(/\s+/g, '-');
  if (statusNormalizado === 'pendente' || statusNormalizado === 'recebida') {
      return 'status-recebida';
  }
  return `status-${statusNormalizado}`;
}

</script>

<style scoped>
/* Estilos para o scroll interno */
.page-container { 
  display: flex;
  flex-direction: column;
  height: calc(100vh - 8rem); 
  background-color: #fff; 
  padding: 20px; 
  border-radius: 8px; 
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); 
}
.header-container { flex-shrink: 0; }
.footer-actions { flex-shrink: 0; }

.table-scroll-container {
  flex-grow: 1;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
}

/* Estilos existentes */
.header-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.header-left { display: flex; flex-direction: column; align-items: flex-start; }
.user-info-wrapper { position: relative; margin-bottom: 8px; }
.user-info { display: flex; align-items: center; cursor: pointer; padding: 4px; border-radius: 6px; }
.user-info:hover { background-color: #f3f4f6; }
.user-icon { width: 20px; height: 20px; color: #4b5563; margin-right: 8px; }
.user-name { font-weight: 500; font-size: 0.9rem; color: #374151; }
.container-title { font-weight: bold; font-size: 1.5em; color: #333; margin: 0; }
.dropdown-menu { position: absolute; top: 100%; left: 0; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); z-index: 10; padding: 8px 0; min-width: 120px; margin-top: 4px; }
.dropdown-item { display: block; width: 100%; text-align: left; padding: 8px 16px; font-size: 0.9rem; color: #374151; background: none; border: none; cursor: pointer; }
.dropdown-item:hover { background-color: #f3f4f6; }
.button-secondary-nav { padding: 10px 15px; background-color: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500; }
.button-secondary-nav:hover { background-color: #5a6268; }
table { width: 100%; border-collapse: collapse; }
thead { background-color: #f8f9fa; position: sticky; top: 0; z-index: 1; }
th, td { border-bottom: 1px solid #e9ecef; padding: 12px 15px; text-align: left; vertical-align: middle; }
th { font-weight: 600; color: #495057; text-transform: uppercase; font-size: 0.85rem; }
tbody tr { cursor: pointer; }
tbody tr:hover { background-color: #eef2f7; }
.row-checked { background-color: #e6f2ff !important; }
.status-badge { padding: 5px 10px; border-radius: 15px; font-size: 0.8em; font-weight: 500; color: #fff; text-transform: capitalize; min-width: 80px; text-align: center; display: inline-block; }
.status-recebida { background-color: #28a745; }
.status-cancelada { background-color: #dc3545; }
.no-data-message, .loading-message { text-align: center; padding: 20px; color: #6c757d; font-style: italic; }
.acoes-cell, .envio-cell { display: flex; align-items: center; gap: 16px; justify-content: center; }
.icon-acao, .icon-acao-prioridade { width: 22px; height: 22px; color: #4b5563; cursor: pointer; transition: color 0.2s; }
.icon-acao:hover { color: #007bff; }
.icon-cancelar:hover { color: #dc3545; }
.icon-prioridade-ativa { color: #f59e0b; }
.footer-actions { display: flex; justify-content: flex-end; padding-top: 20px; margin-top: 20px; border-top: 1px solid #e9ecef; }
.button-primary { padding: 10px 25px; background-color: #153462; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1em; font-weight: 500; }
.button-primary:hover:not(:disabled) { background-color: #112a4f; }
.button-primary:disabled { background-color: #a0aec0; cursor: not-allowed; }

/* REGRAS DE RESPONSIVIDADE */
@media (max-width: 768px) {
  .responsive-table thead {
    display: none;
  }
  .responsive-table tr {
    display: block;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .responsive-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    text-align: right;
    border-bottom: 1px solid #eee;
  }
  .responsive-table td:last-child {
    border-bottom: none;
  }
  .responsive-table td::before {
    content: attr(data-label);
    font-weight: 600;
    text-align: left;
    margin-right: 1rem;
    color: #374151;
  }
  /* Esconde o rótulo da célula do checkbox */
  .responsive-table td[data-label="Selecionar"]::before {
      display: none;
  }
  .responsive-table td[data-label="Ações"] {
      justify-content: center;
  }
}
</style>
