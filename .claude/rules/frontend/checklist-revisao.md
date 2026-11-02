---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/checklist-revisao.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# Checklist de Revisão (usado por `/gen:review`)

## MVVM
- [ ] `.view.tsx` não importa Service/`useInjection`/Redux
- [ ] `.controller.tsx` não retorna JSX
- [ ] `.types.tsx` define `IXxxControllerDeps`/`IXxxController`/`IXxxViewProps`

## Camada de dados
- [ ] Toda chamada de API passa por Service injetado via `useInjection`,
      nunca `axios`/`fetch` direto no controller
- [ ] `XxxService` implementa `IXxxService` e está registrado em
      `xxx.container.ts` + agregado em `loadContainers.ts`
- [ ] Resposta de API validada com `validateResponse`/schema Zod, nunca
      `as TXxxResponse` sem validação
- [ ] Request/Response tipados via `z.infer`, nunca `interface` solta
      duplicando o schema

## Estado
- [ ] Nada em Redux que devia ser `useState` local (checklist de
      `redux-toolkit.md`)
- [ ] Seletor dedicado (`selectXxx`), nunca `state.xxx.campo` direto

## Rotas e acesso
- [ ] Rota nova registrada em `routePaths.ts` + `DataPaths/` + `LazyImports/`
- [ ] Restrição de acesso via `permissionMatrix.ts`/`AccessPolicyBuilder`,
      nunca `if (user.role === ...)` hardcoded num componente

## Estilo e formatação
- [ ] `styled-components` usando `colors`/`theme`, nunca hex/px mágico
- [ ] Import usando alias (`aliases-imports.md`), nunca relativo profundo
      quando existe alias
- [ ] `npm run lint`/`npm run format` rodado sem erro

## Testes
- [ ] Teste em `tests/unit/**` espelhando o caminho de `src/`/`business/`
- [ ] Mock na fronteira do Service, nunca mockando `axios` direto em teste
      de controller
- [ ] Cenário de erro e edge case cobertos, não só happy path

## Segurança
- [ ] Nenhum token em `localStorage`/`sessionStorage`
- [ ] Nenhuma secret/URL de produção hardcoded
