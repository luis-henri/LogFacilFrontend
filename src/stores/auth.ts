import { defineStore } from 'pinia';
import { loginUsuario, type LoginResponse } from '../http/index';
import router from '@/router';

interface User {
  id: number;
  email: string;
  nome: string;
  perfil: {
    id: number;
    nome: string;
  };
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null as string | null,
    user: JSON.parse(localStorage.getItem('user') || 'null') as User | null,
  }),
  getters: {
    isAuthenticated: (state): boolean => !!state.token && !!state.user,
    userPerfil: (state) => state.user?.perfil,
  },
actions: {
    async login(credentials: { cpf: string; password: string }) {
      try {
        const response = await loginUsuario(credentials);
        
        this.token = response.token;
        this.user = response.user;
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // =======================================================================
        // LÓGICA DE REDIRECIONAMENTO INTELIGENTE
        // =======================================================================
        const perfil = this.user?.perfil.nome;

        switch (perfil) {
          case 'Administrador - Geral':
            router.push({ name: 'Monitoramento' });
            break;
          case 'ALMOX - Atendimento':
            router.push({ name: 'Importacao' }); // Ou a tela de Atendimento
            break;
          case 'ALMOX - Separação':
            router.push({ name: 'Separacao' });
            break;
          case 'ALMOX - Conferência':
            router.push({ name: 'Conferencia' });
            break;
          case 'ALMOX - Embalagem':
            router.push({ name: 'Embalagem' });
            break;
          case 'ALMOX - Expedição':
            router.push({ name: 'Remessa' });
            break;
          default:
            // Se o perfil não for reconhecido, envia para uma página segura
            router.push({ name: 'AcessoNegado' });
            break;
        }
      } catch (error) {
        console.error('Login falhou:', error);
        throw error;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    },
    hasAccess(allowedPerfis: string[]): boolean {
      if (!this.userPerfil) return false;
      return allowedPerfis.includes(this.userPerfil.nome);
    }
  }
});