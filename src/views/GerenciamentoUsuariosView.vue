<template>
  <div class="user-management-container">
    <Header />
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
            <div class="form-group">
              <label for="edit-perfil" class="form-label">Perfil</label>
              <select id="edit-perfil" v-model="usuarioEmEdicao.perfilId" required class="form-input">
                <option disabled value="">Selecione um perfil</option>
                <option v-for="perfil in perfisDisponiveis" :key="perfil.id_perfil" :value="perfil.id_perfil">
                  {{ perfil.nome_perfil }}
                </option>
              </select>
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
            <button @click="cancelarEdicao" type="button" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary">Atualizar Usuário</button>
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
            <div class="form-group">
              <label for="add-perfil" class="form-label">Perfil</label>
              <select id="add-perfil" v-model="novoUsuarioForm.perfilId" required class="form-input">
                <option disabled value="">Selecione um perfil</option>
                <option v-for="perfil in perfisDisponiveis" :key="perfil.id_perfil" :value="perfil.id_perfil">
                  {{ perfil.nome_perfil }}
                </option>
              </select>
            </div>
            <div class="form-actions">
                <button @click="fecharModalAdicionar" type="button" class="btn btn-secondary">Cancelar</button>
                <button type="submit" class="btn btn-primary">Salvar Usuário</button>
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
import { obterUsuarios, registrarUsuario, atualizarUsuario as apiAtualizarUsuario, obterPerfis } from '../http'; 
import type { IUsuario, IPerfil } from '../interfaces/IUsuario';
import NotificationPopUp from '@/components/NotificationPopUp.vue';
import { isValidCpf } from '@/utils/validators';
import Header from '@/components/Header.vue';

// =======================================================================
// CORREÇÃO: Definir tipos explícitos para os formulários
// =======================================================================
interface NovoUsuarioForm {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
  perfilId: number | ''; // Permite string vazia para o estado inicial
}

interface UsuarioEditForm extends IUsuario {
    senha?: string;
    ativo?: boolean;
    perfilId?: number;
}

const modoAtual = ref('consultar');
const mostrarModalAdicionar = ref(false);
const usuarios = ref<IUsuario[]>([]);
const loading = ref(true);
const perfisDisponiveis = ref<IPerfil[]>([]);

const filtros = ref({ nome: '', email: '', cpf: '' });
const novoUsuarioForm = ref<NovoUsuarioForm>({ nome: '', email: '', cpf: '', senha: '', perfilId: '' });
const usuarioEmEdicao = ref<UsuarioEditForm | null>(null);

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
  await carregarPerfis();
});

async function carregarPerfis() {
    try {
        const data = await obterPerfis();
        perfisDisponiveis.value = data;
    } catch (error) {
        console.error("Erro ao carregar perfis:", error);
        showNotification('Erro', "Não foi possível carregar a lista de perfis.");
    }
}

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
    showNotification('Erro de Validação', 'O CPF inserido não é válido.');
    return;
  }
  if (!novoUsuarioForm.value.senha) {
    showNotification('Erro','O campo senha é obrigatório.');
    return;
  }
  if (!novoUsuarioForm.value.perfilId) {
    showNotification('Erro','A seleção de um perfil é obrigatória.');
    return;
  }

  try {
    await registrarUsuario({
      nome: novoUsuarioForm.value.nome,
      email: novoUsuarioForm.value.email,
      cpf: novoUsuarioForm.value.cpf.replace(/[.\-]/g, ''),
      password: novoUsuarioForm.value.senha,
      perfilId: novoUsuarioForm.value.perfilId
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
    senha: '',
    perfilId: usuario.perfis && usuario.perfis.length > 0 ? usuario.perfis[0].perfil.id_perfil : undefined
  };
  modoAtual.value = 'editar';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleAtualizarUsuario = async () => {
  if (!usuarioEmEdicao.value) return;

  if (!isValidCpf(usuarioEmEdicao.value.cpf_usuario)) {
    showNotification('Erro de Validação', 'O CPF inserido não é válido.');
    return;
  }
  if (!usuarioEmEdicao.value.perfilId) {
    showNotification('Erro','A seleção de um perfil é obrigatória.');
    return;
  }

  try {
    await apiAtualizarUsuario(usuarioEmEdicao.value.id_usuario, {
      nome: usuarioEmEdicao.value.nome_usuario,
      email: usuarioEmEdicao.value.email_usuario,
      cpf: usuarioEmEdicao.value.cpf_usuario.replace(/[.\-]/g, ''),
      senha: usuarioEmEdicao.value.senha,
      ativo: usuarioEmEdicao.value.ativo,
      perfilId: usuarioEmEdicao.value.perfilId
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
  novoUsuarioForm.value = { nome: '', email: '', cpf: '', senha: '', perfilId: '' };
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

.user-management-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}

.main-title {
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: 600;
}

/* Cards */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.card-title {
  color: #34495e;
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 500;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

/* Formulários */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-size: 14px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* Botões */
.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #f1f1f1;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

/* Tabela */
.table-container {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th {
  background-color: #f8f9fa;
  color: #34495e;
  padding: 12px 15px;
  text-align: left;
  font-weight: 500;
}

.user-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  color: #333;
}

.user-table tr:hover {
  background-color: #f5f5f5;
}

.table-message {
  text-align: center;
  padding: 20px;
  color: #777;
}

/* Status */
.status-pill {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-pill--active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-pill--inactive {
  background-color: #ffebee;
  color: #c62828;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 25px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 20px;
}

/* Switch de Status */
.status-switch {
  display: flex;
  align-items: center;
  gap: 10px;
}

.switch-toggle {
  width: 50px;
  height: 24px;
  border-radius: 12px;
  background-color: #e0e0e0;
  position: relative;
  cursor: pointer;
  border: none;
  padding: 0;
  transition: background-color 0.3s;
}

.switch-toggle.is-active {
  background-color: #4caf50;
}

.switch-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  transition: transform 0.3s;
}

.switch-toggle.is-active .switch-handle {
  transform: translateX(26px);
}

.switch-label {
  color: #777;
  font-size: 14px;
}

.switch-label.is-active {
  color: #4caf50;
  font-weight: 500;
}

/* Ações */
.actions-cell {
  white-space: nowrap;
}

.btn-link {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
}

.btn-link:hover {
  text-decoration: underline;
}

/* Responsividade */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .user-table thead {
    display: none;
  }
  
  .user-table tr {
    display: block;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .user-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: none;
  }
  
  .user-table td::before {
    content: attr(data-label);
    font-weight: 500;
    color: #555;
    margin-right: 10px;
  }
  
  .actions-cell {
    justify-content: center !important;
  }
}

/* Transições */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Notificação */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  /* Mantenha o estilo existente do NotificationPopUp */
}
</style>