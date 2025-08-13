import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/importacao',
      name: 'Importacao',
      component: () => import('../views/ImportacaoView.vue'),
      meta: {
        requiresAuth: true,
        allowedPerfis: ['Administrador - Geral', 'ALMOX - Atendimento']
      }
    },
    {
      path: '/requisicao',
      name: 'Requisicao',
      component: () => import('../views/RequisicoesView.vue'),
      meta: {
        requiresAuth: true,
        allowedPerfis: ['Administrador - Geral', 'ALMOX - Atendimento']
      }
    },
    {
      path: '/gerenciamento-usuarios',
      name: 'GerenciamentoUsuarios',
      component: () => import('../views/GerenciamentoUsuariosView.vue'),
      meta: {
        requiresAuth: true,
        allowedPerfis: ['Administrador - Geral']
      }
    },
    // ... (rotas de fluxo)
    {
      path: '/monitoramento',
      name: 'Monitoramento',
      component: () => import('../views/MonitoramentoView.vue'),
      meta: {
        requiresAuth: true,
        allowedPerfis: ['Administrador - Geral']
      }
    },
    {
      path: '/separacao',
      name: 'Separacao',
      component: () => import('../views/SeparacaoView.vue'),
      meta: {
        requiresAuth: true,
        allowedPerfis: ['Administrador - Geral', 'ALMOX - Separação']
      }
    },
    {
      path: '/separacao-detalhes/:id',
      name: 'SeparacaoDetalhes',
      component: () => import('../views/SeparaçãoDetalhesView.vue'),
      meta: {
        requiresAuth: true,
        allowedPerfis: ['Administrador - Geral', 'ALMOX - Separação']
      }
    },
    {
      path: '/conferencia',
      name: 'Conferencia',
      component: () => import('../views/ConferenciaView.vue'),
      meta: {
        requiresAuth: true,
        allowedPerfis: ['Administrador - Geral', 'ALMOX - Conferência']
      }
    },
    {
      path: '/conferencia-detalhes/:id',
      name: 'ConferenciaDetalhes',
      component: () => import('../views/ConferenciaDetalhesView.vue'),
      meta: {
        requiresAuth: true,
        allowedPerfis: ['Administrador - Geral', 'ALMOX - Conferência']
      }
    },
    {
      path: '/embalagem',
      name: 'Embalagem',
      component: () => import('../views/EmbalagemView.vue'),
      meta: {
        requiresAuth: true,
        allowedPerfis: ['Administrador - Geral', 'ALMOX - Embalagem']
      }
    },
    {
      path: '/embalagem-detalhes/:id',
      name: 'EmbalagemDetalhes',
      component: () => import('../views/EmbalagemDetalhesView.vue'),
      meta: {
        requiresAuth: true,
        allowedPerfis: ['Administrador - Geral', 'ALMOX - Embalagem']
      }
    },
    {
      path: '/remessa',
      name: 'Remessa',
      component: () => import('../views/RemessaView.vue'),
      meta: {
        requiresAuth: true,
        allowedPerfis: ['Administrador - Geral', 'ALMOX - Expedição']
      }
    },
    {
      path: '/remessa-detalhes/:id',
      name: 'RemessaDetalhes',
      component: () => import('../views/RemessaDetalhesView.vue'),
      meta: {
        requiresAuth: true,
        allowedPerfis: ['Administrador - Geral', 'ALMOX - Expedição']
      }
    },
    {
      path: '/acesso-negado',
      name: 'AcessoNegado',
      component: () => import('../views/AcessoNegadoView.vue'), // Precisamos criar este ficheiro
      meta: { requiresAuth: true } // Requer login para ver, mas não tem perfil específico
    }
  ]
});

router.beforeEach((to, from, next) => {
  // Inicializa o store DENTRO do guard para garantir que está disponível
  const authStore = useAuthStore();

  const requiresAuth = to.meta.requiresAuth;
  // Faz um cast explícito para garantir o tipo correto
  const allowedPerfis = (to.meta.allowedPerfis as string[]) || [];

  // Se a rota requer autenticação e o usuário não está logado
  if (requiresAuth && !authStore.isAuthenticated) {
    // Salva a rota que o usuário tentou acessar para redirecioná-lo após o login
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // Se a rota requer um perfil específico
  if (allowedPerfis.length > 0) {
    // E o usuário não tem permissão
    if (!authStore.hasAccess(allowedPerfis)) {
      // Redireciona para uma página de "Acesso Negado"
      return next({ name: 'AcessoNegado' });
    }
  }

  // Se tudo estiver OK, permite a navegação
  next();
});
export default router;
