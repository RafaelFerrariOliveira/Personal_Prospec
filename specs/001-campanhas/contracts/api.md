# Contrato da API: Campanhas (spec 001)

**Data**: 2026-11-02 | **Plano**: [../plan.md](../plan.md)

Contrato de partida para orientar as tasks. Segue o padrão já em uso (`AuthenticationController`): rota `api/<Controller>/<acao_snake_case>`, `[Authorize(Roles = Policy.Administrator)]`, `[EnableRateLimiting]`, `[ProducesResponseType]` completo, comandos devolvem `bool`, erro de negócio vira 400 com lista de notifications. O OpenAPI gerado é a fonte final depois da implementação.

## Regras gerais

- Escrita (`POST`, `PUT`) exige o header `X-CSRF-TOKEN`. Leitura (`GET`) não.
- Ids `Guid`. Datas em ISO 8601 (`Instant`); a tela formata no fuso do computador.
- Paginação: `{ items, totalCount, pageNumber, pageSize, totalPages }`, `pageSize` até 30 (do `PageParams`).
- `get_by_id_campaign` responde 200 com corpo `null` igual para "não existe" e "é de outro tenant" (padrão do projeto, sem 404). 400 para regra de negócio, validação e transição inválida. 401 sem sessão. 403 sem role. 409 para conflito de concorrência (`rowversion`).
- Nenhuma resposta ou mensagem de erro expõe stack trace nem detalhe interno.

## CampaignController

| Método | Rota | Objetivo | Request | Resposta |
|---|---|---|---|---|
| GET | `api/Campaign/get_all_with_pagination_campaign` | Lista (FR-012), mais recente primeiro | query: `status?`, `pageNumber`, `pageSize` | `PageList<CampaignListItemResponse>` |
| GET | `api/Campaign/get_by_id_campaign` | Detalhe com configuração completa | query: `id` | `CampaignDetailResponse` ou `null` |
| POST | `api/Campaign/create_campaign` | Salvar em Rascunho (FR-001, FR-004, FR-013) | `CreateCampaignRequest` (com `requestId` gerado pelo front) | `bool` |
| PUT | `api/Campaign/update_campaign` | Editar em Rascunho ou Pausada (FR-009) | `UpdateCampaignRequest` | `bool` |
| POST | `api/Campaign/start_campaign` | Iniciar (FR-006) | body: `{ id }` | `bool` |
| POST | `api/Campaign/pause_campaign` | Pausar (FR-007) | body: `{ id }` | `bool` |
| POST | `api/Campaign/resume_campaign` | Retomar (FR-008) | body: `{ id }` | `bool` |
| POST | `api/Campaign/cancel_campaign` | Cancelar (FR-010); a confirmação é do front | body: `{ id }` | `bool` |
| GET | `api/Campaign/get_history_campaign` | Histórico de estado e configuração (FR-014) | query: `id`, `pageNumber`, `pageSize` | `PageList<CampaignEventResponse>` |

### Corpos (campos)

`CreateCampaignRequest` (com `requestId`, sem `id`) e `UpdateCampaignRequest` (com o `id` da campanha existente, sem `requestId`):

| Campo | Tipo | Obrigatório |
|---|---|---|
| id | Guid | só no update |
| requestId | Guid | só no create (chave de idempotência) |
| name | string | sim |
| objective | string | sim |
| idealProfile | string | não |
| segment | string | sim |
| services | string | não |
| differentials | string | não |
| valueProposition | string | não |
| targetLeadCount | inteiro | sim |
| locations | lista de `{ state, municipalityCode }` | sim, 1 a 30 |
| cnaeCodes | lista de string (7 dígitos) | sim, 1 a 20 |

`CampaignListItemResponse`: `id`, `name`, `segment`, `locationSummary` (por exemplo "SP, 3 cidades"), `status`, `createdAt`.

`CampaignDetailResponse`: todos os campos acima, mais `status`, `createdAt`, `updatedAt` e `progress` (opcional, nulo até as specs 003 e 004 existirem; formato `{ found, qualified, pending, target }` definido na spec 003).

`CampaignEventResponse`: `type`, `description`, `occurredAt`.

Estados trafegam em inglês (`Draft`, `Running`, `Paused`, `Completed`, `Cancelled`); a tela traduz para os rótulos da spec.

## ReferenceController (somente leitura, dados públicos)

| Método | Rota | Objetivo | Resposta |
|---|---|---|---|
| GET | `api/Reference/get_states_reference` | As 27 UF | lista de `{ code, name }` |
| GET | `api/Reference/get_municipalities_reference` | Municípios de uma UF, com busca por nome | query: `state`, `search?`, `pageNumber`, `pageSize` → `PageList<{ code, name }>` |
| GET | `api/Reference/search_cnae_reference` | Busca de CNAE por código ou descrição | query: `search`, máx. 20 resultados → lista de `{ code, description }` |

Sem `businessUnitId` (decisão P4). Exigem sessão (`[Authorize]`), como o restante.

## Notifications novas (`EMessage`, trace `CampaignTrace`)

Acrescentar ao `EMessage` sem renumerar os existentes, com `[Description]` em pt-BR: transição de estado inválida (com o estado atual), edição não permitida no estado atual, quantidade de leads fora do intervalo, CNAE inexistente, município inexistente na UF informada, lista de localização ou de CNAE vazia ou acima do máximo, chave de idempotência (`requestId`) já usada com dados diferentes. `Required`, `MoreExpected` e `NotFound` já existem e valem para os campos obrigatórios, tamanhos e campanha inexistente.

## Contrato no front

- `ApiControllers` ganha `Campaign` e `Reference` (enum em `business/api/api.controllers.ts`), junto com o primeiro Service que os usa.
- `CampaignService` (`ICampaignService`) e `ReferenceService` (`IReferenceService`) com símbolo e container Inversify; DTOs Zod por endpoint; `ZGuid` para ids; `createPaginatedResponseSchema` para listas.
- Enum de domínio `ECampaignStatus` em `business/domain/enum/`; schema referencia o enum com `z.enum`, nunca `z.string()` solto.
- Todo método aceita `{ signal?: AbortSignal }`.
