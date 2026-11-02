# PersonalProspec: frontend

Esqueleto do front React do PersonalProspec, no Padrão React Front do Rafael (MVVM, Service + DI + Zod).
Objetivo do produto: [A DEFINIR].

## Pré-requisitos

- Node 22 (`.nvmrc`) e npm.
- Api do `../backend/` rodando em `https://localhost:7180` para chamadas reais.

## Como rodar

```bash
cd frontend
npm install
cp .env.example .env   # ajustar se necessário; nunca versionar o .env
npm run dev            # http://localhost:5173
```

Verificações antes de concluir qualquer tarefa: `npm run format`, `npm run lint`, `npm run ts:check`,
`npm run test:unit` (ou `npm run test:coverage`) e `npm run build`.

## Estrutura

```text
frontend/
├── axios/                 instância http única (AxiosBuilder), cookie httpOnly
├── business/
│   ├── api/               ApiControllers (nome de cada controller da Api)
│   ├── application/       dtos/, interfaces/, service/ (BaseService), mappers/, validation/
│   ├── core/ioc/          ioc.config.ts, loadContainers.ts, containers/, references/
│   ├── domain/            contracts/ (ILogger), enum/
│   ├── infrastructure/    logging/ (ConsoleLogger)
│   └── shared/
├── src/
│   ├── access/            controle de acesso (pendente)
│   ├── components/        loading/ (componente sem lógica + story)
│   ├── extensions/        designSystem/ (tokens provisórios)
│   ├── hooks/             useInjection
│   ├── pages/             Home/ (exemplo MVVM) e _templates/page-mvvm/
│   ├── routes/            RoutesApp, AuthRequiredRoutes, DataPaths/, LazyImports/, routePaths
│   └── stores/            Redux Toolkit: só o slice session
└── tests/                 unit/, integration/, e2e/, mocks/, setup/
```

## Pendências

1. **Middlewares do axios** (`axios/axios.instance.ts`): cadeia correlationIdHandler, loggingHandler,
   csrfHandlerMiddleware (header `X-CSRF-TOKEN`), cookieSessionRefreshMiddleware, messageHandlerMiddlware,
   sessionHandlerMiddleware. Depende dos endpoints de autenticação e CSRF do backend.
2. **Bootstrap de sessão e CSRF**: `fetchCsrfToken` + `bootstrapSession`; hoje `AuthRequiredRoutes` é fail-closed
   (nunca libera rota privada).
3. **Módulo `src/access/`**: AccessControl, handlers, `useAccessControl`, `AccessPolicyBuilder`, presets e
   `permissionMatrix`. Depende das roles definidas no backend.
4. **Style Guide / identidade visual**: definir com o Rafael antes de qualquer cor de marca, tipografia ou
   componente visual novo. Tokens atuais são neutros e provisórios.
5. **`useInfiniteScrollQuery`**: criar em `src/hooks/` quando surgir a primeira lista paginada (ver
   `.claude/rules/frontend/infinite-scroll-pagination.md`).
6. **MCP do Storybook**: o addon `@storybook/addon-mcp` já está no `.storybook/main.ts`; falta registrar o servidor
   MCP no Claude Code para a skill `storybook-source-of-truth` (com `npm run storybook` ativo).
7. **`package-lock.json`**: gerar no primeiro `npm install` e versionar.
