---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/dtos-e-validacao.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# DTOs e Validação (Zod)

## Convenção

- `business/application/dtos/request/xxx.request.ts` — `ZXxxRequestSchema` +
  `export type TXxxRequest = z.infer<typeof ZXxxRequestSchema>`
- `business/application/dtos/response/xxx.response.ts` — mesma coisa pra
  `TXxxResponse`
- Variante `*.api.request.ts`/`*.api.response.ts` quando o shape que a API
  espera/devolve difere do shape usado internamente (ex:
  `addressLocation.api.request.ts` vs `addressLocation.request.ts`) — o
  Mapper (`xxxApiMapper.ts`) converte entre os dois, nunca o Service
- Schema de resposta genérico reaproveitado entre vários services (ex:
  `ZApiBooleanResponse`) vive em
  `business/application/validation/apiResponseSchemas.ts`

## Exemplo

```ts
import { z } from 'zod';

export const ZXxxRegisterRequestSchema = z.object({
   name: z.string().min(1).max(120),
   businessUnitId: z.number().int().positive().optional(),
});

export type TXxxRegisterRequest = z.infer<typeof ZXxxRegisterRequestSchema>;
```

```ts
export const ZXxxDetailResponseSchema = z.object({
   id: z.number(),
   name: z.string(),
   createdAt: z.string(),
});

export type TXxxDetailResponse = z.infer<typeof ZXxxDetailResponseSchema>;
```

## Regras

- Tipo nunca escrito à mão com `type`/`interface` quando existe schema por
  trás — sempre `z.infer`
- `Service.validateResponse(schema, data, fallback, origem)` é o único lugar
  que faz `schema.safeParse`/`parse` sobre resposta de API — controller de
  página nunca valida resposta
- Request de formulário (`react-hook-form`) usa o MESMO schema Zod via
  `@hookform/resolvers/zod` — nunca schema duplicado entre form e DTO de
  envio (ver `forms-validation.md`)
- Paginação: schema padrão `{ items, totalCount, pageNumber, pageSize,
  totalPages }` — nunca reinventar shape de página por feature
- Enum de domínio (`business/domain/enum/xxx.enum.ts`) referenciado no
  schema via `z.nativeEnum`/`z.enum`, nunca `z.string()` solto pra um campo
  que é enum
