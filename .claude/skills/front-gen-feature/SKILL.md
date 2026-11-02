---
name: front-gen-feature
description: Gera uma feature completa no frontend do PersonalProspec (Service + Interface + DTOs Zod + Container IoC + Página MVVM + rota + controle de acesso + teste) seguindo o Padrão React Front do Rafael (origem Ponto-Front), Inversify DI e MVVM. Usar sempre que pedirem tela, página ou CRUD novo no front, ou para consumir no front uma entidade criada no backend.
---

# Gerar feature: frontend PersonalProspec

Adaptação da skill `gen-feature` do Ponto-Front para este monorepo: todo caminho abaixo é relativo a `frontend/`. Regras em `.claude/rules/frontend/`.

## Perguntar antes de gerar (não assumir)

1. **Nome da feature** (PascalCase, vira nome de pasta e classe) e **nome do controller na API** (`ApiControllers.Xxx`, igual ao nome do controller C# em `backend/`; confirmar se já existe).
2. **Métodos do Service** (`listPaginated`, `getById`, `register`, `update`, `delete`, ...) e a ação snake_case correspondente no backend (ex.: `get_all_with_pagination_customer`).
3. **A tela precisa de rota própria?** Se sim: path, pública ou privada, item de menu (qual chave de `permissionKeys`).
4. **Restrição de acesso** além de "autenticado" (preset existente ou nova combinação de roles). Se o módulo `src/access/` ainda estiver pendente (ver `frontend/README.md`), avisar.
5. **Identidade visual**: sem Style Guide definido, não inventar cores ou tipografia; usar só os tokens existentes em `src/extensions/designSystem/` e perguntar se faltar token.

## Convenções fixas (aplicar sempre, não perguntar)

- Request/Response sempre `z.infer` de schema Zod (`dtos-e-validacao.md`); id vindo do backend é Guid: `ZGuid` (`business/application/validation/apiResponseSchemas.ts`, baseado em `z.guid()`); paginação via `createPaginatedResponseSchema(itemSchema)` (`{ items, totalCount, pageNumber, pageSize, totalPages }`).
- Service sempre `@injectable()`, `extends BaseService`, `this.execute`/`this.validateResponse`/`buildPath`, `{ signal?: AbortSignal }` em todo método (`services-di-ioc.md`).
- Página com lógica sempre MVVM completo; `useInjection` só no wrapper `Nome.tsx`, que repassa o Service como dep ao controller (`mvvm-pages-components.md`).
- Redux só se o dado for realmente global; dado de feature fica em `useState` no controller (`redux-toolkit.md`).
- Formulário com `react-hook-form` + `zodResolver` usando o MESMO schema do request (`forms-validation.md`).
- Lista com scroll infinito sempre via `useInfiniteScrollQuery` (`infinite-scroll-pagination.md`); se o hook ainda não existir, criá-lo uma única vez em `src/hooks/`.

## Passo a passo

1. Se o controller não existir em `business/api/api.controllers.ts`, adicionar.
2. **DTOs**: `ZXxxRequestSchema`/`ZXxxResponseSchema` por operação, em `business/application/dtos/request/` e `response/`.
3. **Interface + Service**: `IXxxService` em `business/application/interfaces/`, `XxxService` em `business/application/service/`, um método por operação.
4. **IoC**: `business/core/ioc/references/xxx.symbols.ts` + `business/core/ioc/containers/xxx.container.ts`, agregado em `loadContainers.ts`.
5. **Página MVVM**: `src/pages/Xxx/Xxx.tsx`, `.controller.tsx`, `.view.tsx`, `.types.tsx`, `xxx.styles.tsx` (partir de `src/pages/_templates/page-mvvm/`).
6. **Rota** (se pedida): `src/routes/routePaths.ts`, `LazyImports/`, `DataPaths/`.
7. **Acesso** (se pedido): `src/access/types/permissionKeys.ts`, `policies/accessPresets.ts` ou `permissionMatrix.ts`.
8. **Testes**: `tests/unit/pages/Xxx/Xxx.controller.test.tsx` cobrindo caminho feliz, erro do Service e cancelamento por `signal` (`tests-pattern.md`); mock só na fronteira do Service.

## Checklist final

- [ ] DTOs via `z.infer`, sem `interface` duplicando schema
- [ ] Service implementa interface, registrado no container e agregado em `loadContainers.ts`
- [ ] `.view.tsx` sem Service, Redux ou hooks de estado
- [ ] Rota lazy e protegida por `AuthRequiredRoutes` (sem checagem de auth na página)
- [ ] Acesso via policy nomeada, nunca `if (user.role === ...)`
- [ ] Teste de controller cobrindo erro além do caminho feliz
- [ ] `npm run ts:check` e `npm run lint` sem erro (se as dependências já estiverem instaladas)
- [ ] Rodar o agente `front-architecture-auditor` antes de concluir

## Fora do escopo desta skill

Story de componente visual novo (skill `storybook-source-of-truth`); autenticação e sessão (pendentes, revisão extra por tocar `security-frontend.md`); endpoint no backend (skill `back-gen-entity`).
