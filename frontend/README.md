# PersonalProspec: frontend

Esqueleto do front React do PersonalProspec, no Padrão React Front do Rafael (MVVM, Service + DI + Zod).
Objetivo do produto: prospecção B2B com IA (ver `../CLAUDE.md` e `../specs/`). Identidade visual: a do protótipo
oficial (tokens em `src/extensions/designSystem/`).

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
├── axios/                 instância http única (AxiosBuilder), cookie httpOnly e cadeia de middlewares
├── business/
│   ├── api/               ApiControllers (Authentication, Antiforgery, Campaign, Reference)
│   ├── application/       dtos/, interfaces/, service/ (BaseService, authentication, campaign, reference), validation/
│   ├── core/ioc/          ioc.config.ts, loadContainers.ts, containers/, references/
│   ├── domain/            contracts/, enum/, errors/, campaignLimits, campaignStateMachine
│   └── infrastructure/    logging/ (ConsoleLogger)
├── src/
│   ├── access/            controle de acesso (policies, presets, permissionMatrix, useAccessControl)
│   ├── components/        sidebar, brand, icon, loading, statusBadge, cnaeSearchInput, municipalityPicker, campaignActions, campaignHistory
│   ├── extensions/        designSystem/ (cores e fonte do protótipo, medidas, focusRing)
│   ├── hooks/             useInjection, useSessionBootstrap, useInfiniteScrollQuery, useIntersectionObserver, useCampaignDetail
│   ├── pages/             Login, Home, Campaigns, CampaignForm (criar e editar), CampaignDetail, CampaignStarted
│   ├── routes/            RoutesApp, AuthRequiredRoutes, DataPaths/, LazyImports/, routePaths
│   ├── stores/            Redux Toolkit: só session e user
│   └── utils/             apiErrorMessages, formatDate, formatLocationSummary
└── tests/                 unit/, integration/, e2e/, mocks/, setup/
```

## Pendências

1. **MCP do Storybook**: o addon `@storybook/addon-mcp` já está no `.storybook/main.ts`; falta registrar o servidor
   MCP no Claude Code para a skill `storybook-source-of-truth` (com `npm run storybook` ativo).

Feitas: testes e2e (Chromium do Playwright instalado; `npm run test:e2e` roda com API mockada), cobertura medindo também controllers, hooks e utils, middlewares do axios, bootstrap de sessão e CSRF, módulo `src/access/`, identidade visual do protótipo,
`useInfiniteScrollQuery` (primeira lista paginada: campanhas) e `package-lock.json`.
