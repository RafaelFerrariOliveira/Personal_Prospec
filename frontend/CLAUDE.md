# PersonalProspec: frontend

SPA React 19 + TypeScript (strict) que consome a Api .NET de `../backend/`. Segue o Padrão React Front do Rafael
(origem Ponto-Front): MVVM obrigatório, Service + Interface + DI (Inversify) + Zod, Redux só para estado global.

## Instruções de execução

- Não explorar a codebase inteira antes de agir: usar este arquivo e as rules como mapa; ler só o arquivo específico
  quando precisar conferir interface, tipo ou padrão já implementado.
- Todo caminho citado nas rules (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`.
- Ao terminar cada tarefa: listar arquivos criados/alterados, rodar `npm run format`, `npm run lint`,
  `npm run ts:check` e os testes afetados, e orientar o próximo passo.

## Rules (`../.claude/rules/frontend/`)

Fonte das convenções (copiadas do padrão Ponto-Front). Ordem de leitura para feature nova: `estrutura-pastas.md`,
`services-di-ioc.md`, `dtos-e-validacao.md`, `mvvm-pages-components.md`, `react-router.md`, `access-control.md`,
`styled-components.md`, `forms-validation.md`, `tests-pattern.md`. Revisão: `checklist-revisao.md`.

## Contrato com o backend

- Rotas da Api: `api/<Controller>/<acao_snake_case>`. Com `VITE_API_URL=/api`, `buildPath(ApiControllers.Xxx, 'acao')`
  gera `Xxx/acao` relativo ao baseURL.
- Ids são `Guid`: no Zod usar `ZGuid` (`business/application/validation/apiResponseSchemas.ts`, baseado em `z.guid()`).
- Paginação: `createPaginatedResponseSchema(itemSchema)` (`{ items, totalCount, pageNumber, pageSize, totalPages }`).
- Sessão por cookie httpOnly + header `X-CSRF-TOKEN`; token nunca em `localStorage`/`sessionStorage`.

## Comandos npm

| Comando                                          | Uso                                                  |
| ------------------------------------------------ | ---------------------------------------------------- |
| `npm run dev`                                    | Vite em `http://localhost:5173` com proxy `/api`     |
| `npm run build`                                  | `tsc -b` + build de produção                         |
| `npm run ts:check`                               | Checagem de tipos                                    |
| `npm run lint` / `npm run format`                | ESLint 9 / Prettier (3 espaços, aspas simples, 120)  |
| `npm run test:unit` / `npm run test:coverage`    | Vitest (cobertura mínima 80% em funcionalidade nova) |
| `npm run test:e2e` / `npm run test:e2e:real-api` | Playwright mockado / contra a Api real               |
| `npm run storybook` / `npm run build-storybook`  | Storybook 10 (fonte de verdade de UI)                |

## Ferramentas do Claude Code (`../.claude/`)

- Comandos: `/front:feature`, `/front:service`, `/front:page`, `/front:component`, `/front:dto`, `/front:addMethod`,
  `/front:slice`, `/front:test`, `/front:fix`, `/front:review`, `/front:refactorFormat`, `/front:refactorSolid`.
- Skills: `front-gen-feature` (feature completa guiada) e `storybook-source-of-truth` (reuso e stories de UI).
- Agente: `front-architecture-auditor` (audita MVVM, camada de dados, DI e Redux; não corrige código).

## Proibido

- `useInjection` fora do wrapper `Nome.tsx`; controller recebe o service por deps.
- `axios`/`fetch` direto em controller, `new XxxService()`, `response.data` sem `validateResponse`.
- Dado de feature no Redux; `loader`/`action` do React Router; CSS inline; hex/px soltos; `any`.
- Assumir identidade visual: os tokens de `src/extensions/designSystem/` são provisórios até existir Style Guide.
