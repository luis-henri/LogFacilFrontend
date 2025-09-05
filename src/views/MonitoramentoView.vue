<template>
  <div class="container">
    <Header />
    <main class="flex-grow p-4 sm:p-6 lg:p-8">
      <!-- O 'page-container' agora usa flexbox para controlar a altura -->
      <div class="page-container">
        <div class="header-container">
          <div class="header-left">
            <div class="user-info-wrapper">
              <div class="user-info" @click="toggleDropdown">
                <UserCircleIcon class="user-icon"/>
                <span class="user-name">{{ userName }}</span>
              </div>
              <div v-if="isDropdownOpen" class="dropdown-menu">
                <button @click="goUsers" class="gouser-item">Gerenciar Usuários</button>
                <button @click="goRequisicao" class="gouser-item">Requisição</button>
                <button @click="goSeparacao" class="gouser-item">Separação</button>
                <button @click="goConferencia" class="gouser-item">Conferência</button>
                <button @click="goEmbalagem" class="gouser-item">Embalagem</button>
                <button @click="goExpedicao" class="gouser-item">Expedição</button>
                <button @click="handleLogout" class="dropdown-item">Sair</button>
              </div>
            </div>
            <h2 class="container-title">Monitoramento de Requisições</h2>
          </div>
        </div>

        <!-- Filtros -->
        <div class="filters-container">
          <div class="filter-item">
            <label for="data">Data</label>
            <input v-model="filtroData" type="date" id="data" class="filter-input" />
          </div>
          <div class="filter-item">
            <label for="ur">UR</label>
            <input v-model="filtroUR" type="text" id="ur" placeholder="Filtrar por UR" class="filter-input" />
          </div>
          <div class="filter-item">
            <label for="numero">Número da Requisição</label>
            <input v-model="filtroNumero" type="text" id="numero" placeholder="Filtrar por Número" class="filter-input" />
          </div>
          <div class="filter-item">
            <label for="situacao">Situação</label>
            <select v-model="filtroSituacao" id="situacao" class="filter-select">
              <option value="">Todas</option>
              <option value="Pendente">Pendente</option>
              <option value="Em Atendimento">Em Atendimento</option>
              <option value="Em Separação">Em Separação</option>
              <option value="Enviado para Separação">Enviado para Separação</option>
              <option value="Em Conferência">Em Conferência - Separação</option>
              <option value="Enviado para Conferência">Enviado para Conferência - Separação</option>
              <option value="Em Embalagem">Em Embalagem</option>
              <option value="Enviado para Embalagem">Enviado para Embalagem</option>
              <option value="Em Expedição">Em Conferência - Expedição</option>
              <option value="Enviado para Expedição">Enviado para Conferência - Expedição</option>
              <option value="Concluída">Concluída</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
          <div class="filter-item">
            <button @click="limparFiltros" class="button-clear-filters">Limpar Filtros</button>
          </div>
        </div>

        <!-- NOVO CONTAINER PARA A BARRA DE ROLAGEM E RESPONSIVIDADE -->
        <div class="table-scroll-container">
          <div v-if="loading" class="loading-message">Carregando requisições...</div>
          <table v-else class="responsive-table">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>UR</th>
                <th>Número</th>
                <th>Situação</th>
                <th>Ações</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody v-if="!loading">
              <tr v-if="requisicoesFiltradas.length === 0">
                <td colspan="6" class="no-data-message">Nenhuma requisição encontrada com os filtros aplicados.</td>
              </tr>
              <tr v-for="req in requisicoesFiltradas" :key="req.id_requisicao" class="hover:bg-gray-50">
                <td data-label="Data/Hora">{{ new Date(req.data_requisicao).toLocaleString('pt-BR') }}</td>
                <td data-label="UR">{{ req.requisitante_requisicao }}</td>
                <td data-label="Número">{{ req.numero_requisicao }}</td>
                <td data-label="Situação">
                  <span :class="['status-badge', getStatusClass(req.situacao.descricao_situacao_requisicao)]">
                    {{ req.situacao.descricao_situacao_requisicao }}
                  </span>
                </td>
                <td data-label="Ações">
                  <div class="acoes-cell">
                    <div class="tooltip-container" data-tooltip="Visualizar Itens">
                      <EyeIcon @click.stop="openVisualizarItensPopup(req)" class="icon-acao" title="Visualizar Itens" />
                    </div>
                  </div>
                </td>
                <td data-label="Observação">{{ req.observacao_requisicao || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
    
    <VisualizarItensPopup 
      :visible="showItensPopup" 
      :requisicao="requisicaoSelecionada" 
      @close="closeVisualizarItensPopup" 
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
import Header from '@/components/Header.vue';
import { ref, onMounted, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { UserCircleIcon, EyeIcon } from '@heroicons/vue/24/outline';
import VisualizarItensPopup from '../components/VisualizarItensPopup.vue';
import { obterRequisicoesMonitoramento } from '../http/index';
import type { IRequisicoes } from '../interfaces/IRequisicoes';
import NotificationPopUp from '@/components/NotificationPopUp.vue';

const router = useRouter();
const requisicoes = ref<IRequisicoes[]>([]);
const loading = ref(true);
const userName = ref('Usuário');
const isDropdownOpen = ref(false);
const showItensPopup = ref(false);
const requisicaoSelecionada = ref<IRequisicoes | null>(null);

function limparFiltros() {
  filtroData.value = '';
  filtroUR.value = '';
  filtroNumero.value = '';
  filtroSituacao.value = '';
}

// Refs para os filtros
const filtroData = ref('');
const filtroUR = ref('');
const filtroNumero = ref('');
const filtroSituacao = ref('');

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

const requisicoesFiltradas = computed(() => {
  return requisicoes.value.filter(req => {
    const dataMatch = !filtroData.value || req.data_requisicao.startsWith(filtroData.value);
    const urMatch = !filtroUR.value || req.requisitante_requisicao.toLowerCase().includes(filtroUR.value.toLowerCase());
    const numeroMatch = !filtroNumero.value || req.numero_requisicao.toString().includes(filtroNumero.value);
    const situacaoMatch = !filtroSituacao.value || req.situacao.descricao_situacao_requisicao === filtroSituacao.value;
    return dataMatch && urMatch && numeroMatch && situacaoMatch;
  });
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
});

async function carregarDados() {
  loading.value = true;
  try {
    requisicoes.value = await obterRequisicoesMonitoramento();
  } catch (error: any) {
    showNotification('Erro', `Erro ao buscar dados de monitoramento: ${error.message}`);
  } finally {
    loading.value = false;
  }
}

function openVisualizarItensPopup(req: IRequisicoes) {
  requisicaoSelecionada.value = req;
  showItensPopup.value = true;
}

function closeVisualizarItensPopup() {
  showItensPopup.value = false;
}

function toggleDropdown() { isDropdownOpen.value = !isDropdownOpen.value; }

function handleLogout() {
  localStorage.removeItem('user-token');
  router.push({ name: 'Login' });
}
function goUsers() {
  router.push({ name: 'GerenciamentoUsuarios' });
}
function goRequisicao() {
    router.push({ name: 'Requisicao' });
}
function goSeparacao() {
  router.push({ name: 'Separacao' })
}
function goConferencia() {
  router.push({ name: 'Conferencia' })
}
function goEmbalagem() {
  router.push({ name: 'Embalagem' })
}
function goExpedicao() {
  router.push({ name: 'Remessa' })
}

function getStatusClass(situacao: string): string {
  if (!situacao) return 'status-pendente'; 
  
  const statusNormalizado = situacao
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .replace(/\s+/g, '-');

  const statusMap: { [key: string]: string } = {
    'pendente': 'status-pendente',
    'em-atendimento': 'status-em-atendimento',
    'em-separacao': 'status-em-separacao',
    'enviado-para-separacao' : 'status-enviado-para-separacao',
    'em-conferencia-separacao': 'status-em-conferencia-separacao',
    'enviado-para-conferencia-separacao' : 'status-enviado-para-conferencia-separacao',
    'em-embalagem': 'status-em-embalagem',
    'enviado-para-embalagem' : 'status-enviado-para-embalagem',
    'em-conferencia-expedicao': 'status-em-conferencia-expedicao',
    'enviado-para-conferencia-expedicao' : 'status-enviado-para-conferencia-expedicao',
    'concluida': 'status-concluida',
    'cancelada': 'status-cancelada'
  };

  return statusMap[statusNormalizado] || 'status-pendente';
}
</script>

<style scoped>
.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}
/* ESTILOS ATUALIZADOS PARA SCROLL E RESPONSIVIDADE */
.page-container { 
  display: flex;
  flex-direction: column;
  height: calc(100vh - 8rem); /* Altura da tela menos o padding do main */
  background-color: #fff; 
  padding: 20px; 
  border-radius: 8px; 
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); 
}
.header-container { flex-shrink: 0; }

.filters-container {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.filter-item label {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 4px;
}

.filter-input, .filter-select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #fff;
  font-size: 0.875rem;
}

.filter-input:focus, .filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
}

.button-clear-filters {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #f3f4f6;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  align-self: flex-end;
  height: 100%;
}

.button-clear-filters:hover {
  background-color: #e5e7eb;
}


.table-scroll-container {
  flex-grow: 1; /* Faz a área da tabela crescer */
  overflow-y: auto; /* Adiciona scroll vertical quando necessário */
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
.dropdown-item, .gouser-item { display: block; width: 100%; text-align: left; padding: 8px 16px; font-size: 0.9rem; color: #374151; background: none; border: none; cursor: pointer; }
.dropdown-item:hover { background-color: #f3f4f6; }
.gouser-item:hover { background-color: #f3f4f6; }
.button-secondary-nav { padding: 10px 15px; background-color: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500; }
.button-secondary-nav:hover { background-color: #5a6268; }
table { width: 100%; border-collapse: collapse; }
thead { background-color: #f8f9fa; position: sticky; top: 0; z-index: 1; }
th, td { border-bottom: 1px solid #e9ecef; padding: 12px 15px; text-align: left; vertical-align: middle; }
th { font-weight: 600; color: #495057; text-transform: uppercase; font-size: 0.85rem; }
tbody tr:hover { background-color: #eef2f7; }
.status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: white; }
.status-pendente { background-color: #6b7280; }
.status-em-atendimento { background-color: #f59e0b; }
.status-em-separacao, .status-enviado-para-separacao { background-color: #3b82f6; }
.status-em-conferencia, .status-enviado-para-conferencia { background-color: #ea580c; } 
.status-em-embalagem, .status-enviado-para-embalagem { background-color: #14b8a6; }
.status-em-expedicao, .status-enviado-para-expedicao { background-color: #6366f1; }
.status-concluida { background-color: #22c55e; }
.status-cancelada { background-color: #ef4444; }
.no-data-message, .loading-message { text-align: center; padding: 20px; color: #6c757d; font-style: italic; }
.acoes-cell { display: flex; align-items: center; gap: 16px; justify-content: center; }
.icon-acao { width: 22px; height: 22px; color: #4b5563; cursor: pointer; transition: color 0.2s; }
.icon-acao:hover { color: #007bff; }

.tooltip-container {
  position: relative;
  display: inline-flex;
}
.tooltip-container::before,
.tooltip-container::after {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 100%;
  margin-bottom: 8px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  pointer-events: none;
  z-index: 20;
}
.tooltip-container::after {
  content: '';
  background-color: #374151;
  padding: 4px 8px;
  border-radius: 4px;
}
.tooltip-container::before {
  content: attr(data-tooltip);
  min-width: max-content;
  padding: 4px 8px;
  background-color: #374151;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 4px;
}
.tooltip-container:hover::before,
.tooltip-container:hover::after {
  opacity: 1;
  visibility: visible;
}

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
  .acoes-cell {
      justify-content: flex-end;
  }
  .header-container {
    flex-direction: column;
    align-items: stretch;
  }
  .tooltip-container:hover::before,
  .tooltip-container:hover::after,
  .tooltip-container::before {
    display: none;
  }
  /* Transforma cada container de ícone em um bloco vertical (ícone + texto). */
  .tooltip-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px; /* Espaço pequeno entre o ícone e o texto. */
  }
  /* Usa o pseudo-elemento 'after' para criar o rótulo de texto que ficará sempre visível no mobile. */
  .tooltip-container::after {
    content: attr(data-tooltip); /* Pega o texto do atributo 'data-tooltip'. */
    /* Estilos do rótulo de texto. */
    font-size: 0.65rem; /* Fonte bem pequena para não poluir. */
    color: #4b5563;
    font-weight: 500;
    /* Reseta os estilos do tooltip de hover para garantir visibilidade. */
    position: static;
    transform: none;
    opacity: 1;
    visibility: visible;
    background: none;
    padding: 0;
    margin: 0;
    pointer-events: auto;
    border-radius: 0; /* Reseta o border-radius caso tenha herdado. */
  }
}
</style>
