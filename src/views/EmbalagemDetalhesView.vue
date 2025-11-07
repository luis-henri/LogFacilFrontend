<template>
  <div class="container">
    <Header title="Requisição - Embalagem" />
    <main class="flex-grow p-4 sm:p-6 lg:p-8">
      <div class="page-container">
      <div class="header-container">
        <h2 class="container-title">Requisicão - Embalagem</h2>
      </div>

    <div class="content-wrapper" v-if="!loading && requisicao">
      <div class="details-section">
        <div><strong>Número:</strong> {{ requisicao.numero_requisicao }}</div>
        <div><strong>Unidade:</strong> {{ requisicao.requisitante_requisicao }}</div>
        <div><strong>Prioridade:</strong> <span :class="{'text-yellow-600 font-bold': requisicao.prioridade_requisicao}">{{ requisicao.prioridade_requisicao ? 'Sim' : 'Não' }}</span></div>
        <div><strong>Tipo de Envio:</strong> {{ requisicao.tipo_envio?.descricao_tipo_envio_requisicao || 'Não definido' }}</div>
      </div>

      <div class="volumes-section">
        <h3 class="items-title">Dimensões do Volume</h3>
        <button @click="adicionarVolume" class="button-add-volume">Adicionar Volume</button>
      </div>

      <div v-if="!requisicao.volumes || requisicao.volumes.length === 0" class="no-data-message">
        Nenhum volume registado para esta requisição.
      </div>
      <div v-else class="table-container">
        <!-- CLASSE ADICIONADA AQUI -->
        <table class="responsive-table">
          <thead>
            <tr>
              <th>Volume</th>
              <th>Comprimento (cm)</th>
              <th>Largura (cm)</th>
              <th>Altura (cm)</th>
              <th>Peso (kg)</th>
              <th>Excluir</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(volume, index) in requisicao.volumes" :key="index">
              <!-- ATRIBUTOS ADICIONADOS AQUI -->
              <td data-label="Volume">{{ index + 1 }}</td>
              <td data-label="Comprimento (cm)"><input type="number" min="0" placeholder="0" v-model.number="volume.comprimento" class="input-measure"></td>
              <td data-label="Largura (cm)"><input type="number" min="0" placeholder="0" v-model.number="volume.largura" class="input-measure"></td>
              <td data-label="Altura (cm)"><input type="number" min="0" placeholder="0" v-model.number="volume.altura" class="input-measure"></td>
              <td data-label="Peso (kg)"><input type="number" min="0" placeholder="0" v-model.number="volume.peso" class="input-measure"></td>
              <td data-label="Excluir" class="actions-cell">
                <TrashIcon 
                  @click="removerVolume(index)"
                  class="icon-acao icon-cancelar"
                />               
              </td>
            </tr> 
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="loading" class="loading-message">Carregando detalhes da embalagem...</div>
    
    <footer class="footer-actions">
        <button @click="goBack" class="button-secondary">Voltar</button>
        <button @click="efetivarPacote" class="button-primary" :disabled="isSaving">
            {{ isSaving ? 'Aguarde...' : 'Efetivar Pacote' }}
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
import type { IRequisicoes, IVolume } from '../interfaces/IRequisicoes';
import { TrashIcon } from '@heroicons/vue/24/outline';
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
    if (requisicao.value && !requisicao.value.volumes) {
        requisicao.value.volumes = [];
    }
  } catch (error) {
    console.error("Erro ao buscar dados da requisição para embalagem:", error);
     showNotification('Erro', "Não foi possível carregar os dados da requisição.");
  } finally {
    loading.value = false;
  }
});

function adicionarVolume() {
    if (requisicao.value) {
        requisicao.value.volumes.push({
            id_requisicao: requisicao.value.id_requisicao, // Garante a ligação
            comprimento: null,
            largura: null,
            altura: null,
            peso: null,
        });
    }
}

function removerVolume(index: number) {
  if(requisicao.value) {
      requisicao.value.volumes.splice(index, 1);
  }
}

async function efetivarPacote() {
  if (!requisicao.value) return;

  if (!requisicao.value.volumes || requisicao.value.volumes.length === 0) {
    showNotification('Erro de Validação', 'É necessário adicionar pelo menos um volume para efetivar o pacote.');
    return;
  }

  for (const [index, volume] of requisicao.value.volumes.entries()) {
    if (volume.comprimento === null || volume.largura === null || volume.altura === null || volume.peso === null ||
        volume.comprimento <= 0 || volume.largura <= 0 || volume.altura <= 0 || volume.peso <= 0) {
      showNotification(
        'Erro de Validação', 
        `Por favor, preencha todos os campos com valores válidos para o Volume ${index + 1}.`
      );
      return; // Interrompe a função se encontrar um campo inválido
    }
  }

  isSaving.value = true;
  try {
    const dadosParaAtualizar = {
      status: 'enviado-para-conferencia-expedicao',
      volumes: requisicao.value.volumes.map(v => ({
          comprimento: v.comprimento,
          largura: v.largura,
          altura: v.altura,
          peso: v.peso
      }))
    };
    await atualizarRequisicao(requisicao.value.id_requisicao, dadosParaAtualizar);
    
    acaoConcluida.title = 'Embalagem Efetivada!';
    acaoConcluida.message = 'A requisição foi enviada com sucesso para a próxima etapa de conferência.';
    acaoConcluida.visible = true;
    
  } catch (error) {
    console.error("Erro ao efetivar pacote:", error);
    showNotification('Erro',"Não foi possível efetivar o pacote.");
  } finally {
    isSaving.value = false;
  }
}

async function goBack() {
  if (!requisicao.value) {
    router.push({ name: 'Embalagem' });
    return;
  }
  try {
    // 1. Reverte o status da requisição para o estado anterior
    await atualizarRequisicao(requisicao.value.id_requisicao, { status: 'enviado-para-embalagem' });
    
    // 2. Navega de volta para a tela de lista
    router.push({ name: 'Embalagem' });

  } catch (error) {
    console.error("Erro ao voltar e reverter status:", error);
    showNotification('Erro', 'Ocorreu um erro ao tentar voltar.');
    // Mesmo com erro, tenta navegar de volta
    router.push({ name: 'Emabalagem' });
  }
}
</script>

<style scoped>
.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}
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
.icon-acao {
  width: 22px;
  height: 22px;
  color: #4b5563;
  cursor: pointer;
  transition: color 0.2s;
}
.icon-acao:hover {
  color: #007bff;
}
.icon-cancelar:hover {
  color: #dc3545;
}
.volumes-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.items-title { font-size: 1.2rem; font-weight: 600; color: #153462; }
.button-add-volume { padding: 8px 12px; background-color: #16a34a; color: white; border-radius: 5px; font-size: 0.9rem; border: none; }
.table-container { border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; }
thead { background-color: #f8f9fa; }
th { font-weight: 600; color: #495057; }
.input-measure { width: 100px; padding: 5px; border-radius: 5px; border: 1px solid #ccc; text-align: right;}
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
  /* Garante que o input ocupe o espaço disponível no telemóvel */
  .responsive-table .input-measure {
      width: 50%;
  }
  .actions-cell {
      justify-content: flex-end; /* Alinha o ícone à direita */
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
