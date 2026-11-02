---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/typescript.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# TypeScript

`tsconfig.app.json` tem `strict: true` — qualquer regra abaixo que já é
coberta pelo compilador (null-check, etc.) não precisa de disciplina manual,
só não desligar `strict` pra "resolver rápido" um erro de tipo.

## Nomenclatura (confirmada contra o código real — difere de convenção genérica)

- Interface de contrato/shape de objeto: prefixo `I`
  (`IXxxController`, `IXxxService`, `IAccessControl`) — não sufixo `Props`
- Tipo inferido de schema Zod ou alias/union: prefixo `T`
  (`TXxxRequest`, `TXxxResponse`)
- Enum: prefixo `E` (`EHttpsStatus`, `ERoles`, `EProfileType`)
- Prop boolean: prefixo `is`/`has`/`can` (`isLoading`, `canUseFeature`)
- Prop transitória de `styled-components`: prefixo `$` (ver
  `styled-components.md`)

## Tipos

- `interface` pra shape de objeto/contrato (`IXxxController`), `type` pra
  union/intersection/alias e pra tipo inferido de Zod (`z.infer<...>`)
- `any` proibido — usar `unknown` + type guard, ou tipar de verdade
- Usar os utility types nativos (`Partial`, `Pick`, `Omit`, `ReturnType`)
  em vez de redeclarar um tipo quase igual a outro já existente

## Organização

- Tipo usado só numa feature: `Nome.types.tsx` ao lado do componente/página
  (ver `mvvm-pages-components.md`)
- Tipo compartilhado entre features: `business/domain/` (enum) ou pasta
  `types/`/`interfaces/` específica da camada (`business/application/
  interfaces/`)
- Nunca `export *` de barrel genérico escondendo de onde o tipo realmente
  vem — import explícito do arquivo fonte

## Funções e erros

- Função pública (Service, Mapper, hook) sempre com tipo de retorno
  explícito — nunca inferido implicitamente numa função exportada
- `async/await`, nunca `.then()` encadeado
- Erro tratado sempre tipado (`catch (error: unknown)` + narrow), nunca
  `catch (error: any)`
