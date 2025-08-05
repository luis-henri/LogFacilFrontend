<template>
  <div class="user-management-container">
    <h1 class="main-title">Gerenciamento de Usuários</h1>

    <!-- Card de Edição de Usuário -->
    <div v-if="modoAtual === 'editar' && usuarioEmEdicao" class="card edit-form-card">
      <h2 class="card-title">Editar Usuário</h2>
      <form @submit.prevent="handleAtualizarUsuario">
        <div class="form-grid">
            <div class="form-group">
              <label for="edit-nome" class="form-label">Nome</label>
              <input type="text" id="edit-nome" v-model="usuarioEmEdicao.nome_usuario" required class="form-input">
            </div>
            <div class="form-group">
              <label for="edit-email" class="form-label">Email</label>
              <input type="email" id="edit-email" v-model="usuarioEmEdicao.email_usuario" required class="form-input">
            </div>
            <div class="form-group">
              <label for="edit-cpf" class="form-label">CPF</label>
              <input type="text" id="edit-cpf" v-model="usuarioEmEdicao.cpf_usuario" required maxlength="14" class="form-input" placeholder="000.000.000-00">
            </div>
            <div class="form-group">
              <label for="edit-senha" class="form-label">Nova Senha (opcional)</label>
              <input type="password" id="edit-senha" v-model="usuarioEmEdicao.senha" class="form-input" placeholder="Deixe em branco para não alterar">
            </div>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <div class="status-switch">
            <button @click="usuarioEmEdicao.ativo = !usuarioEmEdicao.ativo" type="button" :class="{ 'is-active': usuarioEmEdicao.ativo }" class="switch-toggle">
              <span class="switch-handle"/>
            </button>
            <span class="switch-label" :class="{ 'is-active': usuarioEmEdicao.ativo }">
              {{ usuarioEmEdicao.ativo ? 'Ativo' : 'Inativo' }}
            </span>
          </div>
        </div>
        <div class="form-actions">
          <button @click="cancelarEdicao" type="button" class="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            Atualizar Usuário
          </button>
        </div>
      </form>
    </div>

    <!-- Card de Consulta e Filtro -->
    <div v-show="modoAtual === 'consultar'" class="card filter-card">
      <h2 class="card-title">Consultar Usuários</h2>
      <div class="filter-grid">
        <div class="form-group">
          <label for="filtro-nome" class="form-label">Nome</label>
          <input type="text" id="filtro-nome" v-model="filtros.nome" class="form-input" placeholder="Filtrar por nome...">
        </div>
        <div class="form-group">
          <label for="filtro-email" class="form-label">Email</label>
          <input type="email" id="filtro-email" v-model="filtros.email" class="form-input" placeholder="Filtrar por e-mail...">
        </div>
        <div class="form-group">
          <label for="filtro-cpf" class="form-label">CPF</label>
          <input type="text" id="filtro-cpf" v-model="filtros.cpf" class="form-input" placeholder="Filtrar por CPF...">
        </div>
      </div>
      <div class="add-user-action">
        <button @click="abrirModalAdicionar" class="btn btn-primary">
          Adicionar Novo Usuário
        </button>
      </div>
    </div>

    <!-- Card da Lista de Usuários -->
    <div class="card user-list-card">
      <h2 class="card-title">Lista de Usuários</h2>
      <div class="table-container">
        <table class="user-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>CPF</th>
              <th>Data Cadastro</th>
              <th>Status</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="6" class="table-message">Carregando usuários...</td></tr>
            <tr v-else-if="usuariosFiltrados.length === 0">
              <td colspan="6" class="table-message">Nenhum usuário encontrado.</td>
            </tr>
            <tr v-for="usuario in usuariosFiltrados" :key="usuario.id_usuario" class="user-row">
              <td data-label="Nome">{{ usuario.nome_usuario }}</td>
              <td data-label="Email">{{ usuario.email_usuario }}</td>
              <td data-label="CPF">{{ usuario.cpf_usuario }}</td>
              <td data-label="Data Cadastro">{{ formatarData(usuario.data_cadastro_usuario) }}</td>
              <td data-label="Status">
                <span class="status-pill" :class="usuario.situacao.descricao_situacao_usuario === 'Ativo' ? 'status-pill--active' : 'status-pill--inactive'">
                  {{ usuario.situacao.descricao_situacao_usuario }}
                </span>
              </td>
              <td data-label="Ações" class="actions-cell">
                <button @click="iniciarEdicao(usuario)" class="btn-link">Editar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Adicionar Usuário -->
    <transition name="fade">
      <div v-if="mostrarModalAdicionar" class="modal-overlay">
        <div class="modal-content">
          <h2 class="modal-title">Adicionar Novo Usuário</h2>
          <form @submit.prevent="adicionarUsuario">
            <div class="form-group">
              <label for="add-nome" class="form-label">Nome</label>
              <input type="text" id="add-nome" v-model="novoUsuarioForm.nome" required class="form-input" placeholder="Ex: Maria da Silva">
            </div>
            <div class="form-group">
              <label for="add-email" class="form-label">Email</label>
              <input type="email" id="add-email" v-model="novoUsuarioForm.email" required class="form-input" placeholder="Ex: maria.silva@example.com">
            </div>
            <div class="form-group">
              <label for="add-cpf" class="form-label">CPF</label>
              <input type="text" id="add-cpf" v-model="novoUsuarioForm.cpf" required maxlength="14" class="form-input" placeholder="000.000.000-00">
            </div>
            <div class="form-group">
              <label for="add-senha" class="form-label">Senha</label>
              <input type="password" id="add-senha" v-model="novoUsuarioForm.senha" required class="form-input" placeholder="********">
            </div>
            <div class="form-actions">
              <button @click="fecharModalAdicionar" type="button" class="btn btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                Salvar Usuário
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
    <NotificationPopUp
        :visible="notification.visible"
        :title="notification.title"
        :message="notification.message"
        @close="closeNotification"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { obterUsuarios, registrarUsuario, atualizarUsuario as apiAtualizarUsuario } from '../http';
import type { IUsuario } from '../interfaces/IUsuario';
import NotificationPopUp from '@/components/NotificationPopUp.vue';
import { isValidCpf } from '@/utils/validators';

const modoAtual = ref('consultar');
const mostrarModalAdicionar = ref(false);
const usuarios = ref<IUsuario[]>([]);
const loading = ref(true);

const filtros = ref({ nome: '', email: '', cpf: '' });
const novoUsuarioForm = ref({ nome: '', email: '', cpf: '', senha: '' });
const usuarioEmEdicao = ref<(IUsuario & { senha?: string; ativo?: boolean }) | null>(null);

const notification = reactive({
    visible: false,
    title: '',
    message: ''
});

function showNotification(title: string, message: string) {
    notification.title = title;
    notification.message = message;
    notification.visible = true;
}

function closeNotification() {
    notification.visible = false;
}


onMounted(async () => {
  await carregarUsuarios();
});

async function carregarUsuarios() {
  loading.value = true;
  try {
    usuarios.value = await obterUsuarios();
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    showNotification('Erro', "Não foi possível carregar a lista de usuários.");
  } finally {
    loading.value = false;
  }
}

const adicionarUsuario = async () => {
  if (!isValidCpf(novoUsuarioForm.value.cpf)) {
    showNotification('Erro de Validação', 'O CPF inserido não é válido. Por favor, corrija.');
    return;
  }

  if (!novoUsuarioForm.value.senha) {
    showNotification('Erro','O campo senha é obrigatório.');
    return;
  }

  try {
    await registrarUsuario({
      nome: novoUsuarioForm.value.nome,
      email: novoUsuarioForm.value.email,
      cpf: novoUsuarioForm.value.cpf.replace(/[.\-]/g, ''),
      password: novoUsuarioForm.value.senha
    });
    showNotification('Sucesso','Usuário adicionado com sucesso!');
    fecharModalAdicionar();
    await carregarUsuarios();
  } catch(error: any) {
    showNotification('Erro',`Erro ao adicionar usuário: ${error.message}`);
  }
};

const iniciarEdicao = (usuario: IUsuario) => {
  usuarioEmEdicao.value = {
    ...usuario,
    ativo: usuario.situacao.descricao_situacao_usuario === 'Ativo',
    senha: ''
  };
  modoAtual.value = 'editar';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleAtualizarUsuario = async () => {
  if (!usuarioEmEdicao.value) return;

  if (!isValidCpf(usuarioEmEdicao.value.cpf_usuario)) {
    showNotification('Erro de Validação', 'O CPF inserido não é válido. Por favor, corrija.');
    return;
  }

  try {
    await apiAtualizarUsuario(usuarioEmEdicao.value.id_usuario, {
      nome: usuarioEmEdicao.value.nome_usuario,
      email: usuarioEmEdicao.value.email_usuario,
      cpf: usuarioEmEdicao.value.cpf_usuario.replace(/[.\-]/g, ''),
      senha: usuarioEmEdicao.value.senha,
      ativo: usuarioEmEdicao.value.ativo
    });
    showNotification('Sucesso','Usuário atualizado com sucesso!');
    cancelarEdicao();
    await carregarUsuarios();
  } catch(error: any) {
    showNotification('Erro',`Erro ao atualizar usuário: ${error.message}`);
  }
};

const abrirModalAdicionar = () => { mostrarModalAdicionar.value = true; };
const fecharModalAdicionar = () => {
  mostrarModalAdicionar.value = false;
  novoUsuarioForm.value = { nome: '', email: '', cpf: '', senha: '' };
};
const cancelarEdicao = () => {
  usuarioEmEdicao.value = null;
  modoAtual.value = 'consultar';
}

const usuariosFiltrados = computed(() => {
  if (!usuarios.value || usuarios.value.length === 0) return [];

  const filtroNome = filtros.value.nome.trim().toLowerCase();
  const filtroEmail = filtros.value.email.trim().toLowerCase();
  const filtroCpf = filtros.value.cpf.replace(/[.\-]/g, '');

  if (!filtroNome && !filtroEmail && !filtroCpf) {
    return usuarios.value;
  }

  return usuarios.value.filter(usuario => {
    const nomeUsuario = usuario.nome_usuario.toLowerCase();
    const emailUsuario = usuario.email_usuario.toLowerCase();
    const cpfUsuario = usuario.cpf_usuario.replace(/[.\-]/g, '');

    const matchNome = nomeUsuario.includes(filtroNome);
    const matchEmail = emailUsuario.includes(filtroEmail);
    const matchCpf = cpfUsuario.includes(filtroCpf);

    return matchNome && matchEmail && matchCpf;
  });
});

const formatarData = (dataString?: string) => {
  if (!dataString) return '';
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR');
};

const aplicarMascaraCpf = (valor: string): string => {
  if (!valor) return "";
  let v = valor.replace(/\D/g, '');
  v = v.slice(0, 11);

  if (v.length > 9) {
    v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (v.length > 6) {
    v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (v.length > 3) {
    v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }
  return v;
};

watch(() => novoUsuarioForm.value.cpf, (newValue) => {
  novoUsuarioForm.value.cpf = aplicarMascaraCpf(newValue);
});

watch(() => usuarioEmEdicao.value?.cpf_usuario, (newValue) => {
  if (usuarioEmEdicao.value && newValue) {
    usuarioEmEdicao.value.cpf_usuario = aplicarMascaraCpf(newValue);
  }
});
</script>

<style scoped>
/* ======================================================================= */
/* ESTILOS ATUALIZADOS PARA CORRESPONDER FIELMENTE À IMAGEM DE REFERÊNCIA  */
/* ======================================================================= */

@import url('https://rsms.me/inter/inter.css');

:root {
  --cor-fundo: #F9FAFB;
  --cor-fundo-card: #FFFFFF;
  --cor-primaria: #1E40AF; 
  --cor-primaria-dark: #1E3A8A;
  --cor-tabela-header: #D6E9E3;
  --cor-texto-primaria: #FFFFFF;
  --cor-texto-titulo: #111827;
  --cor-texto-corpo: #374151;
  --cor-texto-label: #6B7280;
  --cor-borda: #E5E7EB;
  --cor-status-ativo-fundo: #D1FAE5;
  --cor-status-ativo-texto: #065F46;
  --cor-status-inativo-fundo: #FEE2E2;
  --cor-status-inativo-texto: #991B1B;
  --sombra-card: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
}

/* Estilo Base */
.user-management-container {
  font-family: 'Inter', sans-serif;
  background-color: var(--cor-fundo);
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.main-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--cor-primaria);
  text-align: center;
  margin-bottom: 2.5rem;
}

/* Card */
.card {
  background-color: var(--cor-fundo-card);
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: var(--sombra-card);
  margin-bottom: 2rem;
  border: 1px solid var(--cor-borda);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--cor-texto-titulo);
  margin-bottom: 1.5rem;
  padding-bottom: 0; /* REMOVIDO */
  border-bottom: none; /* REMOVIDO */
}

/* Formulário */
.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--cor-texto-label);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--cor-borda);
  border-radius: 0.5rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: #FFFFFF;
  color: var(--cor-texto-corpo);
  font-size: 0.875rem;
}
.form-input:focus {
  outline: none;
  border-color: var(--cor-primaria);
  box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.2);
}
.form-input::placeholder {
  color: #9CA3AF;
}

.filter-grid, .form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.add-user-action {
  margin-top: 1.5rem;
  text-align: left;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--cor-borda);
}

/* Botões */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease-in-out;
  text-align: center;
}

.btn-primary {
  background-color: var(--cor-primaria);
  color: var(--cor-texto-primaria);
}
.btn-primary:hover {
  background-color: var(--cor-primaria-dark);
}

.btn-secondary {
  background-color: #F3F4F6;
  color: var(--cor-texto-corpo);
  border: 1px solid var(--cor-borda);
}
.btn-secondary:hover {
  background-color: #E5E7EB;
}

.btn-link {
  background: none;
  border: none;
  color: var(--cor-primaria);
  text-decoration: underline;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}
.btn-link:hover {
  color: var(--cor-primaria-dark);
}

/* Switch de Status */
.status-switch { display: flex; align-items: center; }
.switch-toggle { position: relative; display: inline-flex; height: 1.5rem; width: 2.75rem; border: none; border-radius: 9999px; background-color: #CBD5E0; cursor: pointer; transition: background-color 0.2s ease-in-out; }
.switch-toggle.is-active { background-color: #A7F3D0; }
.switch-handle { display: inline-block; width: 1.25rem; height: 1.25rem; background-color: white; border-radius: 50%; transform: translateX(0.125rem); transition: transform 0.2s ease-in-out; margin: auto 0; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
.switch-toggle.is-active .switch-handle { transform: translateX(1.375rem); }
.switch-label { margin-left: 0.75rem; font-size: 0.875rem; font-weight: 500; color: var(--cor-texto-label); }
.switch-label.is-active { color: var(--cor-status-ativo-texto); }

/* Tabela */
.table-container { overflow-x: auto; }
.user-table { width: 100%; border-collapse: collapse; }
.user-table th, .user-table td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--cor-borda); }
.user-table thead { background-color: var(--cor-tabela-header); }
.user-table th { font-size: 0.75rem; font-weight: 600; color: var(--cor-texto-corpo); text-transform: uppercase; letter-spacing: 0.05em; }
.user-table tbody tr:hover { background-color: #F9FAFB; }
.user-table td { font-size: 0.875rem; color: var(--cor-texto-corpo); }
.text-center { text-align: center; }
.actions-cell { text-align: center; }
.table-message { text-align: center; padding: 2rem; color: #6B7280; }

/* Status Pill */
.status-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem; /* AJUSTADO para cantos arredondados */
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  text-transform: capitalize;
}
.status-pill--active { background-color: var(--cor-status-ativo-fundo); color: var(--cor-status-ativo-texto); }
.status-pill--inactive { background-color: var(--cor-status-inativo-fundo); color: var(--cor-status-inativo-texto); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background-color: rgba(17, 24, 39, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-content { background-color: var(--cor-fundo-card); padding: 2rem; border-radius: 0.75rem; box-shadow: var(--sombra-card); width: 100%; max-width: 500px; }
.modal-title { font-size: 1.25rem; font-weight: 600; color: var(--cor-texto-titulo); margin-bottom: 1.5rem; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Responsividade da Tabela */
@media (max-width: 767px) {
  .user-table thead { display: none; }
  .user-table tr.user-row { display: block; margin-bottom: 1rem; border: 1px solid var(--cor-borda); border-radius: 0.75rem; box-shadow: var(--sombra-card); overflow: hidden; }
  .user-table td { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; text-align: right; border-bottom: 1px solid var(--cor-borda); }
  .user-table tr.user-row td:last-child { border-bottom: none; }
  .user-table td::before { content: attr(data-label); font-weight: 600; text-align: left; margin-right: 1rem; color: var(--cor-texto-titulo); }
  .actions-cell { justify-content: center; padding-top: 1rem; }
}
</style>
