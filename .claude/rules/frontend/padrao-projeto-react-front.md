---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/padrao-projeto-react-front.md". Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

HUB do padrão de Front extraído do Ponto-Front (consome a API .NET descrita em [padrao-projeto-csharp](../backend/padrao-projeto-csharp.md)). Fonte de verdade no repo: `.claude/rules/*.md`; cópia global em `~/.claude/rules/` e `~/.claude/templates/ponto-front/`.

## Stack

Node 22, Vite 8, TypeScript 5.9 (`strict`), React 19, react-router-dom v7 (modo declarativo `<Routes>`, sem loader/action), Redux Toolkit (só estado global), Inversify + reflect-metadata (DI), Zod 4, react-hook-form, styled-components v6, axios (cookie httpOnly + CSRF), Vitest + Testing Library, Storybook 10, Playwright. Prettier: 3 espaços, aspas simples, 120 colunas. Gerenciador: npm.

## Princípios

- Duas raízes: `business/` (independente de framework) e `src/` (React).
- Página/componente com lógica é sempre MVVM (wrapper, controller, view, types, styles).
- Toda chamada de API passa por Service injetado via `useInjection`, resposta validada com Zod.
- Redux só para estado cross-cutting (session, user, theme, roles, businessUnit, ianaTimeZone); dado de feature fica em `useState` no controller.
- Acesso por policy nomeada (`AccessPolicyBuilder`), nunca `if (user.role === ...)`.
- YAGNI, DRY com critério (extrair na terceira ocorrência), KISS, falha explícita.

## Ordem de leitura

1. `frontend-estrutura-pastas` (nota Obsidian): árvore, aliases, regra de dependência, checklist por feature.
2. `frontend-codigo-camada-dados` (nota Obsidian): Service, DTO Zod, mapper, IoC, hook de consumo.
3. `frontend-codigo-pagina-mvvm` (nota Obsidian): página, controller, view, types, rota, acesso.
4. `frontend-componentes-estilo-forms` (nota Obsidian): componente compartilhado, styled-components, formulários, scroll infinito.
5. [frontend-regra-segredos-env](./frontend-regra-segredos-env.md): REGRA de segredos só em `.env`.
6. `frontend-testes-nomenclatura-git` (nota Obsidian): testes, nomenclatura TS, commits, formatação.

**Why:** o Rafael quer reaproveitar o padrão do Ponto-Front em outros projetos de Front.
**How to apply:** em Front novo ou alteração, seguir as notas em ordem; em dúvida, o repo Ponto-Front vence. Não explorar a codebase inteira antes de agir.
