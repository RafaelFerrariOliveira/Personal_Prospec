---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/tests-pattern.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# Regras de Teste

## Onde cada tipo de teste vive (stack real: Vitest + Testing Library + Storybook + Playwright)

- **Localização**: `tests/` na raiz, espelhando a árvore de `src/`/
  `business/` — nunca colocado junto do arquivo testado (`tests/unit/pages/
  Holidays/Holidays.controller.test.ts` testa `src/pages/Holidays/
  Holidays.controller.tsx`, não um `.test.ts` ao lado dele).
- **Unit/lógica** (hooks, controllers, slices, mappers, services): Vitest +
  `@testing-library/react`, em `tests/unit/**`.
- **Integração** (fluxo entre camadas, ex: controller + service mockado):
  `tests/integration/**`.
- **Componente/UI**: story em `*.stories.tsx` (Storybook) com interaction
  test via `@storybook/addon-vitest` — story é a fonte de verdade do estado
  visual (ver skill `storybook-source-of-truth`); não duplicar em
  `tests/unit/components/**` só pra renderizar o mesmo componente — esse
  caminho é pra lógica de `.controller`, não pra snapshot visual.
- **E2E**: Playwright, em `tests/e2e/**`. Testes marcados `@real-api` batem
  na API real (rodam só com `test:e2e:real-api`); o resto roda mockado
  (`test:e2e`/`test:e2e:mock`).
- **A11y**: `@storybook/addon-a11y` roda em cima das stories — não é tipo de
  teste à parte.
- **Mocks/fixtures compartilhados**: `tests/mocks/` (`dto/`, `images/`,
  `testUtils/`).

## Diretrizes Gerais

- Padrão **Arrange-Act-Assert** em todo teste
- Nome do teste descreve o comportamento esperado
- Testes isolados — nunca estado compartilhado entre casos

## Cobertura

- Cobertura mínima de 80% pra funcionalidade nova (`npm run test:coverage`)
- Cobrir caminho feliz, erro e edge case — não só o happy path

## Cenários obrigatórios (unit/integration)

- **Acerto**: entrada válida → resultado correto; combinações distintas de
  entrada válida → saídas distintas corretas
- **Erro**: entrada inválida/ausente → erro tratado; falha de API
  (Service rejeitando) → tratada e comunicada, nunca estado inconsistente
  de UI (loading infinito)
- **Adverso**: valores nulos/vazios em campo obrigatório, limites de
  intervalo, múltiplas chamadas simultâneas (ex: duplo clique em submit)
- **Tratamento de erro**: erro de Service encapsulado, nunca stack trace
  cru na UI; recurso de limpeza (`AbortController`/`signal`) sempre
  respeitado em teste de cancelamento

## Boas práticas

- Mock só na fronteira (Service injetado via `useInjection` — nunca mockar
  `axios` direto num teste de controller, mockar o Service)
- Testes determinísticos — sem depender de `Date.now()`/ordem de execução
  sem controlar
- Mensagem de falha clara — `expect(...).toEqual(...)` com contexto, nunca
  `expect(result).toBeTruthy()` genérico quando dá pra comparar valor exato
- Fixture imutável — clonar antes de alterar dentro do teste
- Sem lógica condicional (`if`/`for`) dentro do teste — extrair em helper
