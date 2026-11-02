---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/services-di-ioc.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# Services, DI (Inversify) e IoC

## Por que existe

`business/application/service/` espelha o `ApplicationService` do backend
.NET: cada feature tem um Service com interface, injetado via Inversify —
nunca instanciado com `new`, nunca chamado via `fetch`/`axios` direto num
componente.

## Arquivos por feature (`Xxx`)

```
business/application/interfaces/xxx.interface.ts   ← IXxxService
business/application/service/xxx.service.ts        ← XxxService extends BaseService implements IXxxService
business/core/ioc/references/xxx.symbols.ts         ← XxxServiceSymbol = Symbol.for('XxxService')
business/core/ioc/containers/xxx.container.ts        ← loadXxxContainer(container)
```

E `loadXxxContainer` precisa ser registrado em
`business/core/ioc/containers/index.ts`/`loadContainers.ts`.

## `IXxxService` (interface)

```ts
export interface IXxxService {
   listPaginated(params: TXxxPageParams, options?: { signal?: AbortSignal }): Promise<TXxxPaginatedResponse>;
   getById(id: number, options?: { signal?: AbortSignal }): Promise<TXxxDetailResponse | null>;
   // ... um método por operação, sempre com { signal?: AbortSignal } opcional
}
```

## `XxxService` (implementação)

```ts
import { BaseService } from '@application/service/Base.service';
import { injectable } from 'inversify';
import { ApiControllers } from '@api/api.controllers';

@injectable()
export class XxxService extends BaseService implements IXxxService {
   public listPaginated = async (params: TXxxPageParams, options?: { signal?: AbortSignal }) => {
      return this.execute(
         'listPaginated',
         async () => {
            const response = await this.http.get(
               this.buildPath(ApiControllers.Xxx, 'get_all_with_pagination_xxx'),
               { params: mapXxxPageParamsToApi(params), ...(options?.signal ? { signal: options.signal } : {}) },
            );
            return this.validateResponse(ZXxxPaginatedResponseSchema, response.data, EMPTY_PAGINATED_RESPONSE, 'XxxService.listPaginated');
         },
         { rethrow: true },
      );
   };
}
```

- Sempre `@injectable()`, sempre `extends BaseService`
- Toda operação passa por `this.execute(nomeOperacao, fn, { rethrow: true })`
  — nunca `try/catch` manual duplicando o que `BaseService.execute` já faz
  (log + tratamento de erro padronizado)
- Toda resposta de API passa por `this.validateResponse(schema, data,
  fallback, 'Xxx.metodo')` — nunca `response.data as TXxxResponse` sem
  validar
- Nome do controller da API sempre via `ApiControllers.Xxx` (enum único em
  `business/api/api.controllers.ts`) — nunca string solta
- `buildPath(controller, acao)` — nunca concatenar URL manualmente

## `loadXxxContainer` (registro IoC)

```ts
import type { Container } from 'inversify';
import { XxxService } from '@application/service/xxx.service';
import type { IXxxService } from '@interfaces/xxx.interface';
import { XxxServiceSymbol } from '@ioc/references/xxx.symbols';

export const loadXxxContainer = (container: Container): void => {
   container.bind<IXxxService>(XxxServiceSymbol).to(XxxService);
};
```

## Consumindo no controller de página/componente

```ts
const xxxService = useInjection<IXxxService>(XxxServiceSymbol);
```

Nunca `new XxxService()`, nunca importar `XxxService` (classe concreta) fora
de `xxx.container.ts` e de teste unitário do próprio service.

## Proibido

- Chamar `axios`/`fetch` diretamente num `.controller.tsx` de página —
  sempre via Service injetado
- `XxxService` sem `IXxxService` correspondente
- `response.data` usado sem passar por `validateResponse`/schema Zod
- Registrar o container e esquecer de agregar em `loadContainers.ts`
