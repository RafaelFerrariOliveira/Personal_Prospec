---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/nomenclatura.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# Nomenclatura

## Arquivos (MVVM — pages e components)

- `Nome.tsx` — wrapper, injeta dependências (`useInjection`) e `useNavigate`,
  repassa pro controller, renderiza a view
- `Nome.controller.tsx` — hook `UseNomeController`, toda a lógica (estado
  local, chamadas de Service, handlers)
- `Nome.view.tsx` — componente puro de apresentação, só recebe props,
  nenhuma chamada de Service/hook de negócio
- `Nome.types.tsx` — `INomeControllerDeps`, `INomeController`,
  `INomeViewProps`
- `nome.styles.ts` — `styled-components`, mesma pasta

## Camada `business/`

- Service: `XxxService` implementa `IXxxService` — arquivo
  `business/application/service/xxx.service.ts` +
  `business/application/interfaces/xxx.interface.ts`
- DTOs: `TXxxRequest`/`TXxxResponse` (type inferido de schema Zod,
  `ZXxxRequestSchema`/`ZXxxResponseSchema`) — nunca `interface` solta sem
  schema por trás
- Mapper: função pura `mapXxxToApi`/`mapXxxFromApi`, arquivo
  `business/application/mappers/xxxApiMapper.ts` — nunca classe
- Container IoC: `loadXxxContainer`, arquivo
  `business/core/ioc/containers/xxx.container.ts`
- Symbol: `XxxServiceSymbol = Symbol.for('XxxService')`, arquivo
  `business/core/ioc/references/xxx.symbols.ts`
- Enum de domínio: `business/domain/enum/xxx.enum.ts`

## Redux (só estado global — ver `redux-toolkit.md`)

- Slice: `xxxSlice.ts` em `src/stores/reducers/xxx/`
- Seletor: `selectXxx`, nunca acesso direto a `state.xxx.campo`
- Action: verbo no infinitivo/imperativo (`setCsrfToken`, `clearSession`)

## Rotas e paths

- `routePaths.ts` — constante única de path por tela
- Componente de página: `PascalCase`, mesmo nome da pasta em `src/pages/`

## Geral

- Hook customizado: `useAlgumaCoisa`
- Tipo/Interface: prefixo `I` (`IXxxController`) pra shape de objeto/contrato,
  `T` (`TXxxRequest`) pra tipo inferido de schema Zod ou union/alias
- Booleano: prefixo `is`/`has`/`can` (`isSessionBootstrapped`, `canUseFeature`)
