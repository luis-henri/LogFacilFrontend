import type { IRequisicoes } from '../interfaces/IRequisicoes';
import type { IUsuario } from '../interfaces/IUsuario';

const API_BASE_URL = 'https://logfacilbackend.onrender.com/api';

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('user-token');
  const headers = new Headers(options.headers || {});

  // Não define Content-Type se for FormData (o browser faz isso automaticamente com o boundary correto)
  if (!(options.body instanceof FormData)) {
      headers.append('Content-Type', 'application/json');
  }

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Ocorreu um erro na API');
  }
  
  return responseData as T;
}


export async function obterRequisicoesMonitoramento(): Promise<IRequisicoes[]> {
  return apiFetch<IRequisicoes[]>('/requisicoes/monitoramento');
}

/**
 * FUNÇÃO ADICIONADA: Busca a lista de tipos de envio disponíveis.
 */
export async function obterTiposEnvio(): Promise<any[]> {
  return apiFetch<any[]>('/requisicoes/tipos-envio');
}

export async function obterRequisicoes(): Promise<IRequisicoes[]> {
  return apiFetch<IRequisicoes[]>('/requisicoes');
}

/**
 * NOVA FUNÇÃO: Busca os detalhes de uma única requisição pelo ID.
 */
export async function obterRequisicaoPorId(id: string | number): Promise<IRequisicoes> {
  return apiFetch<IRequisicoes>(`/requisicoes/${id}`);
}

/**
 * NOVA FUNÇÃO: Envia dados para atualizar uma requisição.
 */
export async function atualizarRequisicao(id: number, data: object): Promise<IRequisicoes> {
  return apiFetch<IRequisicoes>(`/requisicoes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * NOVA FUNÇÃO: Busca requisições filtradas por status.
 */
export async function obterRequisicoesPorStatus(status: string): Promise<IRequisicoes[]> {
  return apiFetch<IRequisicoes[]>(`/requisicoes/status/${status}`);
}

/**
 * NOVA FUNÇÃO: Envia o arquivo para o endpoint de importação.
 */
export async function importarRequisicoes(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch('/requisicoes/importar', {
        method: 'POST',
        body: formData,
    });
}

export async function cancelarRequisicao(id: number): Promise<void> {
  // Implementação futura:
  // await apiFetch(`/requisicoes/${id}`, { method: 'DELETE' });
  console.log(`Simulando cancelamento da requisição ID: ${id}`);
  return Promise.resolve();
}

// FUNÇÕES DE UTILIZADORES ADICIONADAS
export async function obterUsuarios(): Promise<IUsuario[]> {
    return apiFetch('/usuarios');
}

export async function atualizarUsuario(id: number, data: object): Promise<any> {
    return apiFetch(`/usuarios/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

// A função de registro existente pode ser usada para adicionar novos usuários
export async function registrarUsuario(userData: object) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function loginUsuario(credentials: object) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}