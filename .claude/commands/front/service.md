# /front:service

Ao receber este comando, gerar TODOS os artefatos sem pedir confirmação. Caminhos relativos a `frontend/`. Aplicar `.claude/rules/frontend/services-di-ioc.md` e `dtos-e-validacao.md`. Contrato com o backend: ids Guid (`ZGuid` de `business/application/validation/apiResponseSchemas.ts`, baseado em `z.guid()`), paginação `{ items, totalCount, pageNumber, pageSize, totalPages }`, ações snake_case iguais às rotas do controller C#.

```
front:service [NomeFeature]
metodos:    [listPaginated, getById, register, update, delete, ...]
controller: [nome em ApiControllers, igual ao controller C#]
```

Artefatos:
`business/application/dtos/request/nomeFeature.request.ts` (schema Zod),
`business/application/dtos/response/nomeFeature.response.ts` (schema Zod),
`business/application/interfaces/nomeFeature.interface.ts`,
`business/application/service/nomeFeature.service.ts`,
`business/core/ioc/references/nomeFeature.symbols.ts`,
`business/core/ioc/containers/nomeFeature.container.ts` (agregar em `loadContainers.ts`).

Se `controller` não existir em `business/api/api.controllers.ts`, adicionar antes. Ao terminar, listar os arquivos e sugerir o próximo passo (`/front:page` ou `/front:component`).
