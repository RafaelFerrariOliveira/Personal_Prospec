---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/estrutura-pastas.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# Estrutura de Pastas

Duas raízes físicas confirmadas contra o repositório real (não é convenção,
é a árvore que existe hoje):

```
<raiz>/
├── business/                         ← fora de src/, "núcleo" independente de framework
│   ├── api/
│   │   └── api.controllers.ts        ← enum único com o nome de cada controller da API (.NET)
│   ├── application/
│   │   ├── dtos/{request,response}/  ← TxxxRequest/TxxxResponse (schema Zod)
│   │   ├── interfaces/               ← IXxxService
│   │   ├── service/                  ← XxxService extends BaseService implements IXxxService
│   │   ├── mappers/                  ← mapXxxToApi / mapXxxFromApi (funções puras)
│   │   ├── validation/               ← schemas Zod de resposta de API reaproveitados entre services
│   │   └── cache/                    ← cache de query específico (ex: endereço por CEP), opcional
│   ├── core/
│   │   └── ioc/
│   │       ├── containers/           ← 1 arquivo por feature: loadXxxContainer
│   │       ├── references/           ← 1 arquivo por feature: xxx.symbols.ts
│   │       ├── ioc.config.ts
│   │       └── loadContainers.ts     ← agrega todos os loadXxxContainer
│   ├── domain/
│   │   ├── contracts/                ← interfaces de infra (ex: i-logger.ts)
│   │   └── enum/                     ← 1 arquivo por enum de domínio
│   ├── infrastructure/               ← implementações concretas de domain/contracts (logger, etc)
│   └── shared/                       ← utilitário puro sem dependência de feature (dateTime, queryParams)
└── src/
    ├── access/                       ← controle de acesso (ver access-control.md)
    │   ├── core/                     ← AccessControl.ts (fábrica)
    │   ├── handlers/                 ← RouteAccessHandler, MenuAccessHandler, FeatureAccessHandler
    │   ├── hooks/                    ← useAccessControl
    │   ├── policies/                 ← accessPolicyBuilder, presets, matrix
    │   └── types/
    ├── assets/{ico,icons,png,svg}/
    ├── components/                   ← componentes reutilizáveis entre páginas, MVVM (ver mvvm-pages-components.md)
    │   └── <nome>/
    │       ├── Nome.tsx (ou nome.tsx)
    │       ├── nome.controller.tsx   ← só quando o componente tem lógica própria
    │       ├── nome.view.tsx         ← só quando o componente tem lógica própria
    │       ├── nome.types.ts
    │       └── nome.styles.ts
    ├── context/
    ├── extensions/
    ├── hooks/                        ← hooks genéricos (ex: useInjection)
    ├── pages/
    │   ├── _templates/page-mvvm/     ← template de referência, nunca importado em produção
    │   └── <NomeFeature>/
    │       ├── NomeFeature.tsx
    │       ├── NomeFeature.controller.tsx
    │       ├── NomeFeature.view.tsx
    │       ├── NomeFeature.types.tsx
    │       ├── nomeFeature.styles.tsx
    │       └── components/           ← subcomponentes só usados por essa feature (mesmo padrão MVVM)
    ├── routes/                       ← ver react-router.md
    ├── stores/                       ← Redux Toolkit, só estado global (ver redux-toolkit.md)
    ├── stories/                      ← Storybook
    └── utils/

axios/                                ← cliente HTTP, fora de src/ (ver api-integration.md)
```

## Regra de dependência

```
pages/ e components/   → business/application (interfaces/services via DI), stores/ (seletor), access/
business/application    → business/domain, business/api, axios (via Service)
business/domain          → (nenhuma)
business/core/ioc        → business/application (concreto), business/domain (symbol)
axios/                   → (nenhuma camada de business/src — é infraestrutura pura)
```

Página/componente nunca importa `axios/` diretamente, nunca instancia
`XxxService` com `new` — sempre via `useInjection(XxxServiceSymbol)`.

## O que NÃO fazer

- Criar pasta `features/` nova — a convenção de feature já existe via
  `src/pages/<NomeFeature>/` + `business/**/xxx.*`, não duplicar conceito
- Colocar lógica de negócio (chamada de Service, transformação de dado) no
  `.view.tsx` — view só recebe props e renderiza
- Importar `business/application/service/*` direto num componente sem passar
  pela interface + `useInjection`
