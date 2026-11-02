---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/aliases-imports.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# Aliases de Import (`vite.config.ts`/`tsconfig`)

Fonte de verdade: `resolve.alias` em `vite.config.ts`. Sempre usar o alias
mais específico disponível — nunca relativo profundo (`../../../`) quando
existe alias, nunca `@src/pages/...` quando existe `@pages/...` mais direto.

| Alias | Aponta pra |
|---|---|
| `@src` | `src/` |
| `@pages` | `src/pages` |
| `@components` | `src/components` |
| `@hooks` | `src/hooks` |
| `@store` | `src/stores` |
| `@assets` | `src/assets` |
| `@extensions` | `src/extensions` |
| `@routes` | `src/routes` |
| `@access` | `src/access` |
| `@context` | `src/context` |
| `@utils` | `src/utils` |
| `@axios` | `axios/` (fora de `src/`) |
| `@application` | `business/application` |
| `@services` | `business/application` (mesma raiz de `@application`) |
| `@interfaces` | `business/application/interfaces` |
| `@request` | `business/application/dtos/request` |
| `@response` | `business/application/dtos/response` |
| `@dtos` | `business/application/dtos` |
| `@domain` | `business/domain` |
| `@enums` | `business/domain/enum` |
| `@infrastructure` | `business/infrastructure` |
| `@shared` | `business/shared` |
| `@api` | `business/api` |
| `@core` | `business/core` |
| `@ioc` | `business/core/ioc` |

Alias novo (feature que não se encaixa nos existentes) só depois de
confirmar com o time — não inventar alias novo silenciosamente, registrar em
`vite.config.ts` (`resolve.alias`) E no `paths` de `tsconfig.app.json` juntos
(os dois precisam ficar sincronizados, um sem o outro quebra build ou
autocomplete).
