<template>
  <div class="container">
    <Header />
    <main class="flex-grow">
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
                <button @click="goMonitoramento" class="gouser-item">Monitoramento</button>
                <button @click="goSeparacao" class="gouser-item">Separação</button>
                <button @click="goConferencia" class="gouser-item">Conferência</button>
                <button @click="goEmbalagem" class="gouser-item">Embalagem</button>
                <button @click="goExpedicao" class="gouser-item">Expedição</button>
                <button @click="handleLogout" class="dropdown-item">Sair</button>
              </div>
            </div>
            <h2 class="container-title">Requisições - Atendimento</h2>
          </div>
        </div>

        <div class="table-scroll-container">
          <div v-if="loading" class="loading-message">Carregando requisições...</div>
          <table v-else class="responsive-table">
            <thead>
              <tr>
                <th><input type="checkbox" v-model="allSelected" @change="toggleSelectAll" /></th>
                <th>Data/Hora</th>
                <th>UR</th>
                <th>Número</th>
                <th>Situação</th>
                <th>Prioridade - Envio</th>
                <th>Ações</th>
                <th>Observação</th>
              </tr>
            </thead>
            <TransitionGroup tag="tbody" name="list" v-if="!loading">
              <tr v-if="requisicoes.length === 0" key="no-data">
                <td colspan="8" class="no-data-message">Nenhuma requisição encontrada.</td>
              </tr>
              <tr 
                v-for="req in sortedRequisicoes" 
                :key="req.id_requisicao" 
                class="list-item"
                :class="{ 'row-checked': req.checked }" 
                @click="toggleRowSelection(req)"
              >
                <!-- O conteúdo da sua <tr> (as <td>) continua exatamente igual -->
                <td data-label="Selecionar"><input type="checkbox" v-model="req.checked" @click.stop /></td>
                <td data-label="Data/Hora">{{ new Date(req.data_requisicao).toLocaleString('pt-BR') }}</td>
                <td data-label="UR">{{ req.requisitante_requisicao }}</td>
                <td data-label="Número">{{ req.numero_requisicao }}</td>
                <td data-label="Situação">
                  <span :class="['status-badge', getStatusClass(req.situacao.descricao_situacao_requisicao)]">
                    {{ req.situacao.descricao_situacao_requisicao }}
                  </span>
                </td>
                <td data-label="Envio">
                  <div class="envio-cell">
                    <div class="tooltip-container" :data-tooltip="req.prioridade_requisicao ? 'Desmarcar Prioridade' : 'Marcar como Prioritário'">
                      <ArrowUpCircleIcon 
                        @click.stop="handleTogglePrioridade(req)" 
                        :class="['icon-acao-prioridade', { 'icon-prioridade-ativa': req.prioridade_requisicao }]"
                      />
                    </div>
                    <div class="tooltip-container" :data-tooltip="'Alterar Tipo de Envio'">
                      <button 
                        @click.stop="openSelecionarEnvioPopup(req)" 
                        class="button-envio-link"
                        >
                        {{ getDescricaoTipoEnvio(req) }}
                      </button>
                    </div>
                  </div>
                </td>
                <td data-label="Ações">
                  <div class="acoes-cell">
                    <div class="tooltip-container" data-tooltip="Visualizar Itens">
                      <EyeIcon @click.stop="openVisualizarItensPopup(req)" class="icon-acao" />
                    </div>
                    <div class="tooltip-container" data-tooltip="Cancelar Requisição"> 
                    <TrashIcon @click.stop="openCancelarPopup(req)" class="icon-acao icon-cancelar" />
                    </div>
                  </div>
                </td>
                <td data-label="Observação">{{ req.observacao_requisicao || '-' }}</td>
              </tr>
            </TransitionGroup>
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
    <AcaoConcluidaPopup
      :visible="acaoConcluida.visible"
      :title="acaoConcluida.title"
      :message="acaoConcluida.message"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { UserCircleIcon, EyeIcon, TrashIcon, ArrowUpCircleIcon } from '@heroicons/vue/24/outline';
import Header from '../components/Header.vue';
import PopUp from '../components/PopUp.vue';
import VisualizarItensPopup from '../components/VisualizarItensPopup.vue';
import ConfirmarCancelamentoPopup from '../components/ConfirmarCancelamentoPopup.vue';
import NotificationPopUp from '@/components/NotificationPopUp.vue';
import { obterRequisicoesPorStatus, atualizarRequisicao, obterTiposEnvio } from '../http/index';
import type { IRequisicoes } from '../interfaces/IRequisicoes';
import AcaoConcluidaPopup from '@/components/AcaoConcluidaPopup.vue';

const router = useRouter();
const requisicoes = ref<IRequisicoes[]>([]);
const loading = ref(true);
const isSaving = ref(false);
const userName = ref('Usuário');
const isDropdownOpen = ref(false);

const prioritizingId = ref<number | null>(null);

const showEnvioPopup = ref(false);
const showItensPopup = ref(false);
const showCancelarPopup = ref(false);
const requisicaoSelecionada = ref<IRequisicoes | null>(null);
const tiposEnvio = ref<any[]>([]);

const notification = reactive({
    visible: false,
    title: '',
    message: '',
    onCloseCallback: null as (() => void) | null
});

function showNotification(title: string, message: string, callback: (() => void) | null = null) {
    notification.title = title;
    notification.message = message;
    notification.onCloseCallback = callback;
    notification.visible = true;
}

function closeNotification() {
    notification.visible = false;
    if (notification.onCloseCallback) {
        notification.onCloseCallback();
    }
    notification.onCloseCallback = null;
}

const acaoConcluida = reactive({
  visible: false,
  title: '',
  message: '',
});

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

    // Verifica se TODAS as requisições selecionadas têm um tipo de envio
    const todasTemEnvio = selecionadas.every(req => !!req.tipo_envio);
    if (!todasTemEnvio) {
        showNotification('Atenção', 'Por favor, defina o tipo de envio para todas as requisições selecionadas antes de continuar.');
        return;
    }
    
    isSaving.value = true;
    try {
        const promessas = selecionadas.map(req => 
            atualizarRequisicao(req.id_requisicao, { status: 'enviado-para-separacao' })
        );
        await Promise.all(promessas);

        acaoConcluida.title = 'Sucesso!';
        acaoConcluida.message = `${selecionadas.length} requisição(ões) enviada(s) para separação.`;
        acaoConcluida.visible = true;

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
            // Apenas atualizamos os dados. O <TransitionGroup> fará a animação.
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

function getDescricaoTipoEnvio(req: IRequisicoes): string {
  if (req.tipo_envio) {
    return req.tipo_envio.descricao_tipo_envio_requisicao;
  }
  
  // Define "Normal (PAC)" como padrão se não houver tipo definido
  return 'Normal (PAC)';
}


async function handleEnvioConfirm(tipoEnvioId: number) {
    if (!requisicaoSelecionada.value) {
        closeSelecionarEnvioPopup();
        return;
    }

    try {
        const updatedReq = await atualizarRequisicao(
            requisicaoSelecionada.value.id_requisicao, 
            { id_tipo_envio_requisicao: tipoEnvioId }
        );
        
        const index = requisicoes.value.findIndex(r => r.id_requisicao === requisicaoSelecionada.value!.id_requisicao);
        if (index !== -1) {
            requisicoes.value[index].tipo_envio = updatedReq.tipo_envio;
        }
    } catch (error) {
        console.error("Erro ao atualizar tipo de envio:", error);
        showNotification('Erro', "Falha ao guardar o tipo de envio.");
    } finally {
        closeSelecionarEnvioPopup();
    }
}

async function carregarDados() {
  loading.value = true;
  try {
    const dadosApi = await obterRequisicoesPorStatus('pendente');
    requisicoes.value = dadosApi.map(req => ({ 
      ...req, 
      checked: false,
      // Define Normal (PAC) como padrão visual se não tiver tipo de envio
      tipo_envio: req.tipo_envio || { 
        id_tipo_envio_requisicao: 4, 
        descricao_tipo_envio_requisicao: 'Normal (PAC)' 
      }
    }));
  } catch (error: any) {
    showNotification('erro', "Erro ao buscar dados: " + error.message);
  } finally {
    loading.value = false;
  }
}

async function obterIdTipoEnvioPadrao(): Promise<number> {
    const tipoPadrao = tiposEnvio.value.find(t => 
        t.descricao_tipo_envio_requisicao === 'Normal (PAC)'
    );
    
    if (tipoPadrao) {
        return tipoPadrao.id_tipo_envio_requisicao;
    }
    
    // Fallback: retorna o primeiro tipo disponível
    return tiposEnvio.value[0]?.id_tipo_envio_requisicao || 1;
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

/*NaAVEGAÇÃO DE TELAS*/
function toggleDropdown() { isDropdownOpen.value = !isDropdownOpen.value; }
function handleLogout() {
  localStorage.removeItem('user-token');
  router.push({ name: 'Login' });
}
function goUsers() {
  router.push({ name: 'GerenciamentoUsuarios' })
}
function goMonitoramento() {
  router.push({ name: 'Monitoramento' })
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
  if (!situacao) return '';
  const statusNormalizado = situacao.toLowerCase().replace(/\s+/g, '-');
  if (statusNormalizado === 'pendente' || statusNormalizado === 'recebida') {
      return 'status-recebida';
  }
  return `status-${statusNormalizado}`;
}

</script>

<style scoped>
.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}
/* Estilos existentes */
.page-container {
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
.button-envio-link {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font-size: inherit; /* Herda o tamanho da fonte da célula da tabela */
  font-weight: 500;
  text-decoration: underline;
  transition: color 0.2s;
  text-align: left;
}

.button-envio-link:hover {
  color: #2563eb; /* Azul mais escuro ao passar o mouse */
  text-decoration-style: solid; /* Sublinhado sólido ao passar o mouse */
}
.header-container { flex-shrink: 0; }
.footer-actions { flex-shrink: 0; }
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
.header-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.header-left { display: flex; flex-direction: column; align-items: flex-start; }
.user-info-wrapper { position: relative; margin-bottom: 8px; }
.user-info { display: flex; align-items: center; cursor: pointer; padding: 4px; border-radius: 6px; }
.user-info:hover { background-color: #f3f4f6; }
.user-icon { width: 20px; height: 20px; color: #4b5563; margin-right: 8px; }
.user-name { font-weight: 500; font-size: 0.9rem; color: #374151; }
.container-title { font-weight: bold; font-size: 1.5em; color: #333; margin: 0; }
.dropdown-menu { flex-direction: column; position: absolute; top: 100%; left: 0; background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); z-index: 10; padding: 8px 0; min-width: 120px; margin-top: 4px; }
.dropdown-item, .gouser-item { display: block; width: 100%; text-align: left; padding: 8px 16px; font-size: 0.9rem; color: #374151; background: none; border: none; cursor: pointer; }
.dropdown-item:hover { background-color: #f3f4f6; }
.gouser-item:hover { background-color: #f3f4f6; };
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
.list-move, /* aplica-se à transição de movimento */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Garante que os itens que saem não ocupem espaço, para um colapso suave */
.list-leave-active {
  position: absolute;
}

/* REGRAS DE RESPONSIVIDADE */
@media (max-width: 768px) {
  .responsive-table thead { display: none; }
  .responsive-table tr { display: block; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  .responsive-table td { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; text-align: right; border-bottom: 1px solid #eee; }
  .responsive-table td:last-child { border-bottom: none; }
  .responsive-table td::before { content: attr(data-label); font-weight: 600; text-align: left; margin-right: 1rem; color: #374151; }
  .responsive-table td[data-label="Selecionar"]::before { display: none; }
  .responsive-table td[data-label="Ações"] { justify-content: center; }

  /* --- INÍCIO DAS NOVAS REGRAS PARA TOOLTIPS NO MOBILE --- */
  /* Primeiro, desabilitamos o tooltip que aparece ao passar o mouse, pois não funciona no celular. */
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
  /* --- FIM DAS NOVAS REGRAS --- */
} 
@media (min-width: 1024px) {
  .page-container { padding: 2rem; }
}

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

</style>