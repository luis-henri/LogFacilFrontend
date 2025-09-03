LogFácil - Frontend (Vue 3)

Stack

- Vue 3, Vite, TypeScript
- Pinia (store de autenticação)
- Vue Router (guards com `requiresAuth` e `allowedPerfis`)
- Animate.css, Heroicons, Maska

Funcionalidades

- Login e redirecionamento por perfil
- Importação de requisições via arquivo (TXT)
- Monitoramento de requisições e detalhes por etapa (separação, conferência, embalagem, remessa)
- Gerenciamento de usuários (listagem/alteração de perfil e situação)

Variáveis de ambiente

- Criar `.env` na raiz do frontend:

```
VITE_API_URL=http://localhost:3000/api
```

Setup

```
npm install
npm run dev
```

Build

```
npm run build
```

Autenticação e Autorização

- O `Auth Store` (`src/stores/auth.ts`) gerencia `token` e `user` (localStorage)
- `login(credentials)` chama `POST /api/auth/login` e guarda JWT
- Guardas de rota em `src/router/index.ts`:
  - `requiresAuth`: exige login
  - `allowedPerfis`: perfis permitidos por rota (ex.: "Administrador - Geral")

HTTP Client

- `src/http/index.ts` centraliza chamadas à API
- Injeta `Authorization: Bearer <token>` quando disponível
- `importarRequisicoes(file)` usa `FormData` (sem `Content-Type` manual)

Rotas principais

- `/login` (pública)
- `/importacao`, `/requisicao` (Atendimento)
- `/monitoramento`, `/gerenciamento-usuarios` (Admin)
- `/separacao( -detalhes/:id)`, `/conferencia( -detalhes/:id)`, `/embalagem( -detalhes/:id)`, `/remessa( -detalhes/:id)`

