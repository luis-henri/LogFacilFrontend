import { createRouter, createWebHistory } from 'vue-router';

const isAuthenticated = () => {
  return !!localStorage.getItem('user-token');
};

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
    },
    {
      path: '/importacao',
      name: 'Importacao',
      component: () => import('../views/ImportacaoView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/requisicao',
      name: 'Requisicao',
      component: () => import('../views/RequisicoesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/gerenciamento-usuarios',
      name: 'GerenciamentoUsuarios',
      component: () => import('../views/GerenciamentoUsuariosView.vue'),
      meta: { requiresAuth: true }
    },
    // ... (rotas de fluxo)
    {
      path: '/monitoramento',
      name: 'Monitoramento',
      component: () => import('../views/MonitoramentoView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/separacao/',
      name: 'Separacao',
      component: () => import('../views/SeparacaoView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/separacao-detalhes/:id',
      name: 'SeparacaoDetalhes',
      component: () => import('../views/SeparaçãoDetalhesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/conferencia',
      name: 'Conferencia',
      component: () => import('../views/ConferenciaView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/conferencia-detalhes/:id',
      name: 'ConferenciaDetalhes',
      component: () => import('../views/ConferenciaDetalhesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/embalagem',
      name: 'Embalagem',
      component: () => import('../views/EmbalagemView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/embalagem-detalhes/:id',
      name: 'EmbalagemDetalhes',
      component: () => import('../views/EmbalagemDetalhesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/remessa',
      name: 'Remessa',
      component: () => import('../views/RemessaView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/remessa-detalhes/:id',
      name: 'RemessaDetalhes',
      component: () => import('../views/RemessaDetalhesView.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;
