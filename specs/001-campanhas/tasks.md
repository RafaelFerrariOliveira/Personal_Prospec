---

description: "Tarefas da spec 001: campanhas de prospecção (Fase 2 do plano geral)"
---

# Tasks: Campanhas de prospecção

**Input**: `specs/001-campanhas/spec.md` e `plan.md`, mais `research.md`, `data-model.md`, `contracts/api.md`, `quickstart.md` desta pasta e `specs/000-plano-geral/`.

**Prerequisites**: spec 002 funcionando (Api e front sobem, login valida). Spikes S1.1 (municípios) e S1.2 (CNAE) concluídos em 2026-11-02 (`docs/discovery/spikes-s1-1-e-s1-2-referencias.md`); os seeds já estão em `backend/Src/PersonalProspec.Infra/ORM/Seeds/Data/` (`cnae.tsv` e `municipios.tsv`).

**Tests**: INCLUÍDOS. A constituição (princípio IV) exige teste na granularidade das rules: 1 arquivo por método de service, 1 por endpoint e Builder compartilhado no backend; Vitest por controller, service e DTO no frontend, story com os estados para componente reutilizável.

**Organization**: Setup, Fundação (bloqueia as histórias), depois uma fase por história na ordem de prioridade da spec: US1 (criar e salvar, P1), US2 (controlar a execução, P2), US3 (consultar lista e histórico, P3), e Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1, US2 ou US3, só nas fases de história
- Caminhos relativos à raiz do repositório. `Src` = `backend/Src`, `Tests` = `backend/Tests`. Comandos `dotnet` rodam a partir de `backend/Src`.

## Regras de execução (valem para todas as tarefas)

- Segredo nunca entra no repositório, em log, em resposta nem em mensagem de erro. Esta spec não cria chave de segredo nova.
- Pacote novo, `dotnet restore`, `npm install` e commit só com pedido do Rafael. Nenhum pacote novo está previsto (FluentValidation, react-hook-form, `@hookform/resolvers`, Zod e Inversify já estão instalados).
- Namespaces `PersonalProspec.<Camada>`. `sealed` por padrão, primary constructors, file-scoped namespaces. Datas só por `IClock`, nunca `DateTime.Now`. Colunas em snake_case, como `EventMapping`.
- Valores de partida sem fonte (`plan.md`, tabela "Valores de partida") ficam em `CampaignOptions` e no `appsettings.json`, nunca fixos no código.
- DOC-STYLE-001: nenhum travessão (U+2014) em código, comentário, doc ou mensagem.
- `EMessage`: acrescentar entradas sem renumerar as existentes. `Event.Description` aceita no máximo 500 caracteres.
- Todo controller de página do front trata 400 (mostra `error.messages`), 401, 500 e erro de rede, com mensagem genérica nos dois últimos; nunca stack trace cru na UI nem tela carregando para sempre.
- Mensagens ao usuário em pt-BR via `EMessage` (backend) e Zod ou controller (frontend), nunca string solta na view.
- Estilo só com tokens de `colors` e `theme` (`frontend/src/extensions/designSystem/`), `focusRing` em todo elemento interativo, estados `:hover`, `:active` e `:disabled`.

---

## Phase 1: Setup (aceites, spikes e linha de base)

**Purpose**: liberar o que depende do Rafael e provar que o esqueleto está verde antes de alterá-lo.

- [X] T001 Pedir ao Rafael (respondido em 2026-11-02, registrado em `plan.md` Clarifications: P1 rejeitado, servidor gera o `Id` e o front envia só `requestId`; P4 aceito; valores de `CampaignOptions` aceitos): (a) aceite do desvio P1 (id da campanha gerado no front) e do desvio P4 (UF, municípios e CNAE sem `BusinessUnitId`), ambos em `plan.md` Complexity Tracking; (b) confirmar ou trocar os valores de partida de `CampaignOptions` (500 leads, 20 CNAE, 30 cidades, tamanhos de campo); registrar as respostas em `plan.md`, seção Clarifications.
- [X] T002 [P] Spike S1.1 (concluído em 2026-11-02): lista de municípios por UF verificada em dados reais da Receita; resultado e limites em `docs/discovery/spikes-s1-1-e-s1-2-referencias.md` e seed em `Src/PersonalProspec.Infra/ORM/Seeds/Data/municipios.tsv` (5.571 linhas, `código<TAB>UF<TAB>nome`, código da Receita).
- [X] T003 [P] Spike S1.2 (concluído em 2026-11-02): `Cnaes.zip` lido e convertido; seed em `Src/PersonalProspec.Infra/ORM/Seeds/Data/cnae.tsv` (1.358 linhas, `código<TAB>descrição`, UTF-8, sem o placeholder `8888888`); resultado em `docs/discovery/spikes-s1-1-e-s1-2-referencias.md`.
- [X] T004 Rodar `dotnet build ../PersonalProspec.slnx` e `dotnet test ../PersonalProspec.slnx` em `backend/Src`, e `npm run ts:check`, `npm run lint` e `npm run test:unit` em `frontend`; registrar o resultado como linha de base verde.

**Checkpoint**: aceites registrados, fontes das listas definidas, linha de base verde.

---

## Phase 2: Foundational (bloqueia todas as histórias)

**Purpose**: entidades, mapeamentos, migration, seed de referência, opções, mensagens e peças compartilhadas do front.

**CRÍTICO**: nenhuma história começa antes do checkpoint desta fase.

### Domain

- [X] T005 [P] Criar `Src/PersonalProspec.Domain/Enums/ECampaignStatus.cs` (`byte`): `Draft = 1, Running, Paused, Completed, Cancelled`.
- [X] T006 [P] Criar `Src/PersonalProspec.Domain/Entities/Campaign.cs` (`sealed`, `ITenantOwned`): `Id` (`Guid`, `init`, gerado pelo servidor), `RequestId` (`Guid`, chave de idempotência), `Name` (`string`, obrigatório, trim, máx. 120), `Objective` (`string`, obrigatório, máx. 500), `IdealProfile` (`string?`, máx. 1000), `Segment` (`string`, obrigatório, máx. 120), `Services` (`string?`, máx. 1000), `Differentials` (`string?`, máx. 1000), `ValueProposition` (`string?`, máx. 1000), `TargetLeadCount` (`int`, de 1 até `CampaignOptions.MaxTargetLeadCount`), `Status` (`ECampaignStatus`), `CreatedAt` (`Instant`, `init`), `UpdatedAt` (`Instant`), `BusinessUnitId` (`Guid`, `init`), `RowVersion` (`byte[]`), e as coleções `Locations` e `Cnaes`.
- [X] T007 [P] Criar `Src/PersonalProspec.Domain/Entities/CampaignLocation.cs` (`sealed`, `ITenantOwned`): `Id`, `CampaignId`, `State` (`string`, 2 caracteres, UF da lista fixa de 27), `MunicipalityCode` (`string`, 4 dígitos, código do município na Receita existente em `Municipality` e pertencente à UF), `BusinessUnitId`. Pelo menos 1 por campanha, máx. 30, todas da mesma UF, sem repetição.
- [X] T008 [P] Criar `Src/PersonalProspec.Domain/Entities/CampaignCnae.cs` (`sealed`, `ITenantOwned`): `Id`, `CampaignId`, `CnaeCode` (`string`, 7 dígitos, existente em `Cnae`), `BusinessUnitId`. Pelo menos 1 por campanha, máx. 20, sem repetição.
- [X] T009 [P] Criar `Src/PersonalProspec.Domain/Entities/Cnae.cs` (`Code` string(7) chave, `Description`) e `Src/PersonalProspec.Domain/Entities/Municipality.cs` (`Code`, `State` string(2), `Name`). Sem `ITenantOwned` (decisão P4).
- [X] T010 [P] Criar `Src/PersonalProspec.Domain/Handlers/CampaignSettings/CampaignStateMachine.cs` (`static`): `CanTransition(from, to)` com exatamente `Draft→Running`, `Running→Paused`, `Paused→Running`, `Running→Completed`, `Draft|Running|Paused→Cancelled`, e `CanEdit(status)` verdadeiro só em `Draft` e `Paused`. `Completed` e `Cancelled` são finais.
- [X] T011 [P] Criar `Src/PersonalProspec.Domain/Providers/CampaignOptions.cs`: `SectionName = "Campaign"`, `MaxTargetLeadCount` (500), `MaxCnaePerCampaign` (20), `MaxCitiesPerCampaign` (30), `NameMaxLength` (120), `ObjectiveMaxLength` (500), `SegmentMaxLength` (120), `LongTextMaxLength` (1000). Valores de partida sem fonte.
- [X] T012 [P] Em `Src/PersonalProspec.Domain/Handlers/NotificationSettings/EMessage.cs`, acrescentar ao final, com `[Description]` em pt-BR e sem renumerar: `CampaignInvalidTransition` ("A campanha está {0} e não pode ser {1}."), `CampaignNotEditable` ("A campanha está {0}. Só é possível alterar em Rascunho ou Pausada; pause antes."), `OutOfRange` ("O campo {0} deve estar entre {1} e {2}."), `CnaeNotFound` ("CNAE {0} não encontrado."), `MunicipalityNotInState` ("O município {0} não pertence à UF {1}."), `ItemCountOutOfRange` ("O campo {0} exige de {1} a {2} itens."), `DuplicateItem` ("{0} repetido."), `CampaignIdInUse` ("Já existe uma campanha com esta chave de solicitação e dados diferentes."). `Required`, `MoreExpected` e `NotFound` já existem e valem para obrigatório, tamanho e campanha inexistente.
- [X] T013 [P] Criar em `Src/PersonalProspec.Domain/Interfaces/RepositoryContracts/`: `ICampaignRepository` (`SaveAsync(Campaign)`, `UpdateAsync(Campaign)`, `FindByIdAsync(Guid id, Guid businessUnitId)` com filhos, `FindPagedAsync(ECampaignStatus? status, PageParams)`) e `IReferenceRepository` (`GetMunicipalitiesAsync(string state, string? search, PageParams)`, `SearchCnaeAsync(string search, int limit)`, `ExistsCnaeAsync(IEnumerable<string>)`, `MunicipalitiesBelongToStateAsync(string state, IEnumerable<string>)`). A UF é lista fixa e não passa por repositório.
- [X] T014 [P] Criar `Tests/PersonalProspec.UnitTest/Domain/Handlers/CampaignSettings/CampaignStateMachineTests.cs`: cada par válido devolve `true`, cada par inválido devolve `false` (incluindo `Completed` e `Cancelled` como origem, e `Running→Running`), `CanEdit` só em `Draft` e `Paused`.
- [X] T015 [P] Criar `Tests/PersonalProspec.UnitTest/Domain/Handlers/NotificationSettings/EMessageCampaignTests.cs` no mesmo formato de `EMessageAuthTests.cs`: descrição não vazia e diferente do nome, e `FormatTo` preenche todos os marcadores.

### Infra

- [X] T016 [P] Criar `Src/PersonalProspec.Infra/ORM/Mappings/CampaignMapping.cs` (`BaseMapping<Campaign>`, tabela `Campaign`, colunas snake_case): `name` `nvarchar(120)`, `objective` `nvarchar(500)`, `ideal_profile`, `services`, `differentials`, `value_proposition` `nvarchar(1000)` anuláveis, `segment` `nvarchar(120)`, `target_lead_count` `int`, `status` `tinyint`, `created_at` e `updated_at` `datetime2`, `business_unit_id`, `request_id` `uniqueidentifier` com índice único (`business_unit_id`, `request_id`), `row_version` com `IsRowVersion()`; índice (`business_unit_id`, `status`, `created_at` desc).
- [X] T017 [P] Criar `Src/PersonalProspec.Infra/ORM/Mappings/CampaignLocationMapping.cs` (FK para `Campaign` em cascata; índice único (`campaign_id`, `state`, `municipality_code`)) e `CampaignCnaeMapping.cs` (FK em cascata; índice único (`campaign_id`, `cnae_code`)).
- [X] T018 [P] Criar `Src/PersonalProspec.Infra/ORM/Mappings/CnaeMapping.cs` (`code` `varchar(7)` chave, `description` `nvarchar(200)`) e `MunicipalityMapping.cs` (`code` `char(4)` chave, `state` `char(2)`, `name` `varchar(60)`; índice (`state`, `name`)). Tamanhos conforme o spike (descrição até 159 caracteres, nome até 32).
- [X] T019 Em `Src/PersonalProspec.Infra/ORM/Mappings/EventMapping.cs`, trocar o comentário "sem chave estrangeira" de `CampaignId` por FK para `Campaign` com `DeleteBehavior.NoAction`; `CompanyId` segue sem FK.
- [X] T020 [P] Criar `Src/PersonalProspec.Infra/Repositories/CampaignRepository.cs` (`RepositoryBase<Campaign>`): consulta sempre com `businessUnitId` no predicado, `Include` de `Locations` e `Cnaes` no detalhe, lista ordenada por `CreatedAt` desc usando `IPaginationQueryService<Campaign>`.
- [X] T021 [P] Criar `Src/PersonalProspec.Infra/Repositories/ReferenceRepository.cs`: busca de município e de CNAE sem acento e sem diferenciar caixa (collation `Latin1_General_CI_AI` via `EF.Functions.Collate`; conferir a tradução no teste de integração), `SearchCnaeAsync` limitado a 20.
- [X] T022 Criar `Src/PersonalProspec.Infra/ORM/Seeds/ReferenceSeed.cs`: idempotente, lê `Data/cnae.tsv` e `Data/municipios.tsv` (UTF-8, separados por tabulação, sem cabeçalho) como recursos embutidos (declarar em `PersonalProspec.Infra.csproj`), grava só o que falta e falha com mensagem clara se uma linha não tiver o número esperado de colunas; chamar no `MigrateDatabaseAsync` (`Src/PersonalProspec.Api/Settings/Handlers/MigrationHandlerSettings.cs`) depois do `InitialSeed`.
- [X] T023 Gerar a migration `AddCampaigns` com `dotnet ef migrations add AddCampaigns --project PersonalProspec.Infra --startup-project PersonalProspec.Api` (connection string de desenho por variável de ambiente, sem `database update`) e revisar o SQL: tabelas, FKs, índices únicos, `row_version`, FK de `Event.campaign_id`.

### ApplicationService e Api

- [X] T024 [P] Criar `Src/PersonalProspec.ApplicationService/Traces/CampaignTrace.cs` (`static class` com `const string`): `Create`, `Update`, `Start`, `Pause`, `Resume`, `Cancel`, `GetById`, `GetAll`, `GetHistory`, `Reference`.
- [X] T025 [P] Criar `Src/PersonalProspec.ApplicationService/Services/CampaignServices/CampaignEventRecorder.cs` (`sealed`, usa `IEventRepository` e `IClock`): `RecordAsync(Guid campaignId, Guid businessUnitId, string type, string description)` grava `Event` com `Category = Campaign` e `Source = "Campaign"`; tipos `CampaignCreated`, `CampaignUpdated` (a descrição lista só os nomes dos campos alterados), `CampaignStarted`, `CampaignPaused`, `CampaignResumed`, `CampaignCancelled`. Descrição até 500 caracteres, nunca dado sensível.
- [X] T026 [P] Criar os DTOs de request em `Src/PersonalProspec.ApplicationService/Dtos/CampaignDtos/Request/` (`sealed record`, Request com `set`): `LocationRequest` (`State`, `MunicipalityCode`), `CreateCampaignRequest` (`RequestId` no lugar de `Id`) e `UpdateCampaignRequest` (`Id`; ambos com `Name`, `Objective`, `IdealProfile`, `Segment`, `Services`, `Differentials`, `ValueProposition`, `TargetLeadCount`, `Locations`, `CnaeCodes`; obrigatórios com `required` conforme `contracts/api.md`), `CampaignIdRequest` (`Id`), `CampaignListRequest` (`Status`, mais `PageParams`) e `CampaignHistoryRequest` (`Id`, mais `PageParams`).
- [X] T027 [P] Criar os DTOs de response em `Src/PersonalProspec.ApplicationService/Dtos/CampaignDtos/Response/` (`sealed record`, Response com `init`): `CampaignListItemResponse` (`Id`, `Name`, `Segment`, `LocationSummary`, `Status`, `CreatedAt`), `CampaignDetailResponse` (campos completos, `Locations`, `CnaeCodes`, `Status`, `CreatedAt`, `UpdatedAt`, `Progress` anulável), `CampaignEventResponse` (`Type`, `Description`, `OccurredAt`), `StateResponse`, `MunicipalityResponse` e `CnaeResponse`.
- [X] T028 Criar `Src/PersonalProspec.Domain/EntitiesValidation/CampaignValidation.cs` (`Validate<Campaign>`, FluentValidation, no Domain como manda a rule; valida a entidade já mapeada) com as regras do `data-model.md`: nome, objetivo e segmento obrigatórios, com `Trim` e só espaços como vazio, tamanhos máximos de `CampaignOptions`, `TargetLeadCount` de 1 até `MaxTargetLeadCount`, `Locations` de 1 a `MaxCitiesPerCampaign` itens sem repetição e todas na mesma UF da lista de 27, `CnaeCodes` de 1 a `MaxCnaePerCampaign` itens com 7 dígitos e sem repetição; mensagens por `EMessage`. Reutilizar para `UpdateCampaignRequest` por método genérico ou segunda classe, sem duplicar regra.
- [X] T029 [P] Criar `Src/PersonalProspec.ApplicationService/Interfaces/MapperContracts/ICampaignMapper.cs` e `Src/PersonalProspec.ApplicationService/Mappers/CampaignMapper.cs` (manual): request para entidade (com `Instant` do `IClock` e `BusinessUnitId`), entidade para `CampaignListItemResponse` (`LocationSummary` como "SP, 3 cidades") e `CampaignDetailResponse`, `Event` para `CampaignEventResponse`.
- [X] T030 Registrar nos containers de `Src/PersonalProspec.Api/IoC/Containers/`: repositórios (`RepositoryContainer`), validação (`ValidationContainer`), mapper (`MapperContainer`), `CampaignEventRecorder` (`ServiceContainer`); registrar `CampaignOptions` com `SetConfigureOptionsWithValidation` em `ProviderSettings.cs` (todos os limites positivos, `ValidateOnStart`); acrescentar a seção `Campaign` só com os valores de partida em `Src/PersonalProspec.Api/appsettings.json`.
- [X] T031 Em `Src/PersonalProspec.Api/Middlewares/GlobalExceptionMiddleware.cs`, tratar `DbUpdateConcurrencyException` devolvendo 409 com uma notification genérica em pt-BR (acrescentar a entrada em `EMessage`, sem renumerar), e cobrir em `Tests/PersonalProspec.UnitTest/Api/Middlewares/GlobalExceptionMiddlewareTests.cs`.
- [X] T032 [P] Criar `Tests/PersonalProspec.UnitTest/Builders/CampaignBuilderTest.cs` e `CreateCampaignRequestBuilderTest.cs` (Builder fluente compartilhado: padrões válidos e métodos `WithStatus`, `WithoutName`, `WithTargetLeadCount`, `WithLocations`, `WithCnaes`).
- [X] T033 Em `Tests/PersonalProspec.IntegrationTest/Settings/`, garantir que o `DatabaseFixture` aplique a migration e o `ReferenceSeed` e que `Respawn` NÃO apague `Cnae` e `Municipality` entre testes; criar helper `CampaignSeedTools.cs` para gravar campanhas de teste por tenant.

### Frontend compartilhado

- [X] T034 [P] Em `frontend/business/api/api.controllers.ts`, acrescentar `Campaign: 'Campaign'` e `Reference: 'Reference'`.
- [X] T035 [P] Criar `frontend/business/domain/enum/campaignStatus.enum.ts` (`ECampaignStatus` com `Draft`, `Running`, `Paused`, `Completed`, `Cancelled`) e o mapa de rótulos em pt-BR (Rascunho, Em execução, Pausada, Concluída, Cancelada).
- [X] T036 [P] Criar `frontend/src/hooks/useInfiniteScrollQuery.ts` exatamente com a assinatura de `.claude/rules/frontend/infinite-scroll-pagination.md` (`fetchPage`, `filters`, `pageSize`, `enabled`; devolve `items`, `isLoadingFirstPage`, `isLoadingMore`, `hasMore`, `error`, `loadMore`, `reload`) e `frontend/tests/unit/hooks/useInfiniteScrollQuery.test.ts` (reset ao mudar filtro com cancelamento por `AbortSignal`, `loadMore` travado, erro na página 2 preserva itens).
- [X] T037 [P] Criar o componente `frontend/src/components/statusBadge/` (sem lógica: `statusBadge.tsx`, `statusBadge.types.ts`, `statusBadge.styles.ts`, `statusBadge.stories.tsx`): recebe `status` e mostra rótulo e cor por tokens (`colors.feedback`); story com os estados default, loading, empty, error e disabled e uma por status.
- [X] T038 [P] Em `frontend/src/access/types/permissionKeys.ts` acrescentar `PermissionKeys.menu.campaigns`; em `permissionMatrix.ts` mapear para `AccessPresets.authenticated`; atualizar `frontend/tests/unit/access/policies/evaluateAccessPolicy.test.ts` se necessário.

**Checkpoint**: `dotnet build` e `dotnet test` verdes, migration revisada, seed de referência aplicando, front com `ts:check` verde.

---

## Phase 3: User Story 1 - Criar e salvar uma campanha por formulário guiado (Priority: P1) MVP

**Goal**: o usuário percorre o formulário em etapas, revisa o resumo e salva; a campanha fica em "Rascunho".

**Independent Test**: preencher todas as etapas, salvar e conferir "Rascunho" com todos os dados; deixar campo obrigatório vazio e ver o campo indicado; voltar de etapa e manter os dados; dois cliques em "Salvar" geram uma só campanha (spec 001, cenários 1 a 3 da US1 e edge cases).

### Backend

- [X] T039 [US1] Criar `Src/PersonalProspec.ApplicationService/Interfaces/ServiceContracts/ICampaignCommandService.cs` e `Src/PersonalProspec.ApplicationService/Services/CampaignServices/CampaignCommandService.cs` (`sealed`, herda `ServiceBase`) com `CreateCampaignAsync(CreateCampaignRequest, Guid businessUnitId)`: validar por `CampaignValidation`, conferir que cada CNAE existe e cada município pertence à UF informada (por `IReferenceRepository`), tratar `RequestId` repetido (mesmo tenant e mesmos dados devolve `true` sem criar outra; dados diferentes devolve `EMessage.CampaignIdInUse`); o `Id` é gerado pelo servidor, gravar `Campaign` em `Draft` com `CreatedAt` e `UpdatedAt` por `IClock`, registrar `CampaignCreated`; erro de negócio vira notification com `CampaignTrace.Create`, nunca exceção.
- [X] T040 [P] [US1] Criar `Tests/PersonalProspec.UnitTest/ApplicationService/Services/CampaignServices/Base/CampaignCommandServiceSetup.cs` e `.../CreateCampaignAsyncTests.cs`: sucesso grava em `Draft` com evento; campo obrigatório vazio e só espaços; tamanhos acima do máximo; `TargetLeadCount` 0, negativo e acima do máximo; localização e CNAE vazios e acima do máximo; item repetido; CNAE inexistente; município de outra UF; mesmo `RequestId` com mesmos dados é idempotente; mesmo `RequestId` com dados diferentes é recusado; nada é gravado em caso de erro.
- [X] T041 [P] [US1] Criar `Tests/PersonalProspec.UnitTest/ApplicationService/Services/CampaignServices/CampaignValidationTests.cs`: um caso por regra do T028, incluindo os limites exatos (1 e `MaxTargetLeadCount`, 120 e 121 caracteres).
- [X] T042 [US1] Criar `Src/PersonalProspec.ApplicationService/Interfaces/ServiceContracts/IReferenceQueryService.cs` e `Src/PersonalProspec.ApplicationService/Services/ReferenceServices/ReferenceQueryService.cs`: `GetStatesAsync()` (as 27 UF em lista fixa com código e nome), `GetMunicipalitiesAsync(string state, string? search, PageParams)` (UF fora da lista devolve página vazia ou notification de formato inválido) e `SearchCnaeAsync(string search)` (busca com no mínimo 2 caracteres, até 20 resultados). Registrar em `ServiceContainer`.
- [X] T043 [P] [US1] Criar `Tests/PersonalProspec.UnitTest/ApplicationService/Services/ReferenceServices/GetStatesAsyncTests.cs`, `GetMunicipalitiesAsyncTests.cs` e `SearchCnaeAsyncTests.cs` (27 UF; busca sem acento; limite de 20; UF inválida; termo curto).
- [X] T044 [US1] Criar `Src/PersonalProspec.Api/Controllers/CampaignController.cs` (`[Authorize(Roles = Policy.Administrator)]`, `[EnableRateLimiting]`, `[ProducesResponseType]` completo) com `POST create_campaign` (`User.GetBusinessUnitId()`), e `Src/PersonalProspec.Api/Controllers/ReferenceController.cs` com `GET get_states_reference`, `GET get_municipalities_reference` e `GET search_cnae_reference` conforme `contracts/api.md`.
- [X] T045 [P] [US1] Criar `Tests/PersonalProspec.UnitTest/Api/Controllers/CampaignControllerTests/Base/CampaignControllerSetup.cs`, `CreateCampaignTests.cs`, e `.../ReferenceControllerTests/GetStatesReferenceTests.cs`, `GetMunicipalitiesReferenceTests.cs`, `SearchCnaeReferenceTests.cs` (metadata por reflection: `[Authorize]`, role, rate limit, rota, tipos de resposta).
- [X] T046 [P] [US1] Criar `Tests/PersonalProspec.IntegrationTest/Executions/CampaignControllerTests/CreateCampaign.cs`: caminho feliz (Rascunho gravado, evento `CampaignCreated`); POST sem CSRF recusado; 401 sem cookie; 403 com role sem permissão via `TestAuthHandler`; dados obrigatórios faltando devolve 400 com os campos; mesmo `requestId` duas vezes em paralelo cria uma só.
- [X] T047 [P] [US1] Criar `Tests/PersonalProspec.IntegrationTest/Executions/ReferenceControllerTests/GetStatesReference.cs`, `GetMunicipalitiesReference.cs` e `SearchCnaeReference.cs` (feliz; 401; busca sem acento confirma a collation do T021; limite de 20).

### Frontend

- [X] T048 [P] [US1] Criar `frontend/business/application/dtos/request/campaign.request.ts` (`ZCreateCampaignRequestSchema`: nome, objetivo e segmento com `trim` e `min(1)`, tamanhos máximos iguais aos de `CampaignOptions`, `targetLeadCount` inteiro positivo até o máximo, `locations` de 1 a 30, `cnaeCodes` de 1 a 20 com 7 dígitos, `requestId` com `ZGuid`) e `frontend/business/application/dtos/response/reference.response.ts` (`ZStateResponse`, `ZMunicipalityResponse`, `ZCnaeResponse`, paginado por `createPaginatedResponseSchema`); tipos por `z.infer`.
- [X] T049 [US1] Criar `frontend/business/application/interfaces/campaign.interface.ts` (`ICampaignService` com `createCampaign`) e `reference.interface.ts` (`IReferenceService`: `getStates`, `getMunicipalities`, `searchCnae`), os services em `frontend/business/application/service/campaign.service.ts` e `reference.service.ts` (`extends BaseService`, `execute`, `validateResponse`, `buildPath`, `{ signal?: AbortSignal }`), os símbolos em `frontend/business/core/ioc/references/`, os containers `campaign.container.ts` e `reference.container.ts`, e o registro em `loadContainers.ts`.
- [X] T050 [P] [US1] Criar o componente `frontend/src/components/cnaeSearchInput/` (MVVM, com lógica: busca com debounce de 300 ms no controller, no máximo 20 resultados, seleção múltipla com limite de 20, `data-testid`) com `cnaeSearchInput.stories.tsx` nos estados default, loading, empty, error e disabled.
- [X] T051 [P] [US1] Criar o componente `frontend/src/components/municipalityPicker/` (MVVM: escolhe UF da lista e depois uma ou mais cidades da UF, máx. 30, busca com debounce) com story dos 5 estados.
- [X] T052 [US1] Criar a página `frontend/src/pages/CampaignForm/` (5 arquivos MVVM: `CampaignForm.tsx`, `CampaignForm.controller.tsx`, `CampaignForm.view.tsx`, `CampaignForm.types.tsx`, `campaignForm.styles.ts`): um `useForm` com `zodResolver(ZCreateCampaignRequestSchema)`, índice de etapa no `useState` (identificação, localização, perfil, oferta, quantidade de leads, resumo), validação só dos campos da etapa ao avançar, voltar mantém os dados, resumo antes de salvar, `requestId` gerado com `crypto.randomUUID()` ao abrir, botão de salvar travado por `formState.isSubmitting`, tratamento de 400, 401, 500 e erro de rede, e após salvar leva à lista com confirmação. Só o wrapper usa `useInjection` e `useNavigate`.
- [X] T053 [US1] Registrar a rota privada `campaignNew: '/campaigns/new'` em `frontend/src/routes/{routePaths.ts, LazyImports/private.tsx, DataPaths/private.ts}`.
- [X] T054 [P] [US1] Criar `frontend/tests/unit/business/application/dtos/campaign.request.test.ts` (limites exatos, só espaços, quantidade 0 e negativa, listas vazias e acima do máximo) e `frontend/tests/unit/business/application/service/campaign.service.test.ts` e `reference.service.test.ts` (erro rejeita, validação Zod, `signal` respeitado, mock na fronteira).
- [X] T055 [P] [US1] Criar `frontend/tests/unit/pages/CampaignForm/CampaignForm.controller.test.tsx` (avançar bloqueado com campo faltante, voltar mantém dados, resumo, duplo clique gera uma chamada, erros 400/401/500/rede) e `frontend/tests/unit/components/cnaeSearchInput/cnaeSearchInput.controller.test.tsx` e `municipalityPicker.controller.test.tsx`.
- [X] T056 [P] [US1] Criar `frontend/tests/e2e/campaignCreate.spec.ts` (Playwright, API mockada): preencher as etapas, ver o resumo, salvar e ver a campanha na lista; campo faltante indicado.
- [ ] T057 [US1] Validar a história: rodar `dotnet test`, `npm run test:unit`, `npm run test:e2e` e executar à mão os cenários 1 a 6 do `quickstart.md`.

**Checkpoint**: US1 funcional e testável sozinha. É o MVP da spec 001.

---

## Phase 4: User Story 2 - Controlar a execução da campanha (Priority: P2)

**Goal**: iniciar, pausar, retomar, cancelar e editar (em Rascunho ou Pausada), com histórico; a campanha mostra o estado e as ações permitidas.

**Independent Test**: iniciar uma campanha, pausar, tentar editar em execução (recusado), editar pausada, retomar e cancelar (spec 001, cenários 1 a 6 da US2).

### Backend

- [X] T058 [US2] Acrescentar a `ICampaignCommandService` e a `CampaignCommandService.cs` os métodos `UpdateCampaignAsync(UpdateCampaignRequest, Guid businessUnitId)`, `StartCampaignAsync(Guid id, Guid businessUnitId)`, `PauseCampaignAsync`, `ResumeCampaignAsync` e `CancelCampaignAsync`, todos buscando por `id` e `businessUnitId` (inexistente e de outro tenant respondem igual, `EMessage.NotFound`), usando `CampaignStateMachine` e devolvendo `EMessage.CampaignInvalidTransition` ou `CampaignNotEditable` com o estado atual; cada um atualiza `UpdatedAt` e grava o evento correspondente.
- [X] T059 [US2] Implementar `UpdateCampaignAsync`: só em `Draft` ou `Paused`; reaplicar a validação e as conferências de CNAE e município; regravar `Locations` e `Cnaes` na mesma transação; o evento `CampaignUpdated` lista só os nomes dos campos alterados.
- [X] T060 [US2] Implementar `StartCampaignAsync` (`Draft→Running`, evento `CampaignStarted`). Deixar um comentário `shortcut:` informando que o enfileiramento da pesquisa entra na spec 003, dentro da mesma transação (decisão P2).
- [X] T061 [US2] Implementar `PauseCampaignAsync` (`Running→Paused`, evento `CampaignPaused`).
- [X] T062 [US2] Implementar `ResumeCampaignAsync` (`Paused→Running`, evento `CampaignResumed`; nunca chamado por rotina automática).
- [X] T063 [US2] Implementar `CancelCampaignAsync` (`Draft|Running|Paused→Cancelled`, evento `CampaignCancelled`; não apaga dado coletado nem histórico).
- [X] T064 [P] [US2] Criar `.../CampaignServices/UpdateCampaignAsyncTests.cs` (edita em `Draft` e `Paused`; recusa em `Running`, `Completed` e `Cancelled`; troca localização e CNAE; evento só com nomes de campo; outro tenant igual a inexistente).
- [X] T065 [P] [US2] Criar `.../CampaignServices/StartCampaignAsyncTests.cs` (`Draft` inicia; segunda chamada recusada; `Cancelled` recusado; evento gravado).
- [X] T066 [P] [US2] Criar `.../CampaignServices/PauseCampaignAsyncTests.cs` (`Running` pausa; em `Draft` e `Paused` recusa).
- [X] T067 [P] [US2] Criar `.../CampaignServices/ResumeCampaignAsyncTests.cs` (`Paused` retoma; em outros estados recusa).
- [X] T068 [P] [US2] Criar `.../CampaignServices/CancelCampaignAsyncTests.cs` (cancela em `Draft`, `Running` e `Paused`; em `Completed` e `Cancelled` recusa; nada é apagado).
- [X] T069 [US2] Criar `Src/PersonalProspec.ApplicationService/Interfaces/ServiceContracts/ICampaignQueryService.cs` e `Services/CampaignServices/CampaignQueryService.cs` com `GetByIdCampaignAsync(Guid id, Guid businessUnitId)` (devolve `null` igual para inexistente e de outro tenant; `Progress` nulo até as specs 003 e 004) e `.../CampaignServices/GetByIdCampaignAsyncTests.cs`. O detalhe entra nesta fase porque a página de controle depende dele.
- [X] T070 [US2] Acrescentar ao `CampaignController.cs` as actions `PUT update_campaign`, `POST start_campaign`, `POST pause_campaign`, `POST resume_campaign`, `POST cancel_campaign` e `GET get_by_id_campaign`, conforme `contracts/api.md`.
- [X] T071 [P] [US2] Criar em `Tests/PersonalProspec.UnitTest/Api/Controllers/CampaignControllerTests/`: `UpdateCampaignTests.cs`, `StartCampaignTests.cs`, `PauseCampaignTests.cs`, `ResumeCampaignTests.cs`, `CancelCampaignTests.cs`, `GetByIdCampaignTests.cs` (metadata por reflection).
- [X] T072 [P] [US2] Criar em `Tests/PersonalProspec.IntegrationTest/Executions/CampaignControllerTests/`: `UpdateCampaign.cs`, `StartCampaign.cs`, `PauseCampaign.cs`, `ResumeCampaign.cs`, `CancelCampaign.cs` e `GetByIdCampaign.cs` (feliz; POST sem CSRF recusado; 401; 403; campanha de outro tenant responde como inexistente; transição inválida devolve 400; edição em `Running` recusada; `start_campaign` duas vezes em paralelo gera uma só transição no histórico; conflito de `row_version` devolve 409).

### Frontend

- [X] T073 [P] [US2] Criar `frontend/business/application/dtos/request/campaignId.request.ts` (`ZCampaignIdRequestSchema`), `ZUpdateCampaignRequestSchema` em `campaign.request.ts` e `frontend/business/application/dtos/response/campaignDetail.response.ts` (`ZCampaignDetailResponseSchema` com `progress` opcional e `status` por `z.enum`).
- [X] T074 [US2] Acrescentar a `ICampaignService` e a `campaign.service.ts`: `updateCampaign`, `startCampaign`, `pauseCampaign`, `resumeCampaign`, `cancelCampaign` e `getCampaignById` (retorna `null` em 404).
- [X] T075 [P] [US2] Criar o componente `frontend/src/components/campaignActions/` (MVVM, com lógica): botões Iniciar, Pausar, Retomar, Cancelar e Editar habilitados conforme `CanTransition` e `CanEdit` espelhados em `frontend/business/domain/`, confirmação obrigatória antes de cancelar, botão desabilitado durante a chamada, e story nos 5 estados.
- [X] T076 [US2] Criar a página `frontend/src/pages/CampaignDetail/` (5 arquivos MVVM): configuração completa (nome, objetivo, localização, perfil, segmento, CNAE, serviços, diferenciais, proposta de valor, meta), `statusBadge`, `campaignActions`, mensagem "pesquisa ainda não executada" no lugar dos contadores (R10), recusa de edição em execução com a mensagem de pausar antes, e tratamento de 404 igual para inexistente.
- [X] T077 [US2] Criar a página `frontend/src/pages/CampaignStarted/` (5 arquivos MVVM): tela "Agente de IA iniciado" com nome, meta e localização, atalho para o detalhe e redirecionamento automático ao detalhe depois de 3 segundos (valor de partida, `research.md` R9), limpando o temporizador ao sair da página (FR-015).
- [X] T078 [US2] Estender `CampaignForm` para o modo edição: rota `campaigns/:id/edit`, carrega por `getCampaignById`, bloqueia fora de Rascunho e Pausada, salva por `updateCampaign`; manter o mesmo schema Zod.
- [X] T079 [US2] Registrar em `frontend/src/routes/{routePaths.ts, LazyImports/private.tsx, DataPaths/private.ts}` as rotas `campaignDetail: '/campaigns/:id'`, `campaignEdit: '/campaigns/:id/edit'` e `campaignStarted: '/campaigns/:id/started'` (função de montagem do path em `routePaths.ts`, nunca string solta na página).
- [X] T080 [P] [US2] Criar `frontend/tests/unit/pages/CampaignDetail/CampaignDetail.controller.test.tsx`, `CampaignStarted/CampaignStarted.controller.test.tsx` (redireciona após 3 s com temporizador falso e limpa ao desmontar), `frontend/tests/unit/components/campaignActions/campaignActions.controller.test.tsx` (matriz estado x ação, confirmação de cancelamento, duplo clique) e os testes de `campaign.service` e de DTO para os métodos novos.
- [X] T081 [P] [US2] Criar `frontend/tests/e2e/campaignControl.spec.ts` (API mockada): iniciar e ver a tela "Agente de IA iniciado" e o detalhe, pausar, tentar editar em execução, editar pausada, retomar e cancelar com confirmação.
- [ ] T082 [US2] Validar a história: testes verdes e roteiro manual dos cenários 7 a 14 do `quickstart.md`.

**Checkpoint**: US1 e US2 funcionam de forma independente.

---

## Phase 5: User Story 3 - Consultar campanhas e seu detalhe (Priority: P3)

**Goal**: lista de campanhas com filtro por estado, mais recentes primeiro, lista vazia com ação de criar, e histórico no detalhe.

**Independent Test**: com campanhas em estados diferentes, abrir a lista, filtrar por estado, abrir uma e ver o histórico (spec 001, cenários 1 a 3 da US3).

### Backend

- [X] T083 [US3] Acrescentar a `ICampaignQueryService` e a `CampaignQueryService.cs`: `GetAllWithPaginationCampaignAsync(CampaignListRequest, Guid businessUnitId)` (filtro opcional por estado, `CreatedAt` desc, `PageParams` com máximo de 30) e `GetHistoryCampaignAsync(CampaignHistoryRequest, Guid businessUnitId)` (eventos `Category = Campaign` da campanha, `OccurredAt` desc, paginado; campanha de outro tenant devolve página vazia igual a inexistente). Criar `.../CampaignServices/GetAllWithPaginationCampaignAsyncTests.cs` e `GetHistoryCampaignAsyncTests.cs`.
- [X] T084 [US3] Acrescentar ao `CampaignController.cs` as actions `GET get_all_with_pagination_campaign` e `GET get_history_campaign`, e criar `Tests/PersonalProspec.UnitTest/Api/Controllers/CampaignControllerTests/GetAllWithPaginationCampaignTests.cs` e `GetHistoryCampaignTests.cs`.
- [X] T085 [P] [US3] Criar `Tests/PersonalProspec.IntegrationTest/Executions/CampaignControllerTests/GetAllWithPaginationCampaign.cs` (feliz; ordem do mais recente ao mais antigo; filtro por estado; paginação; isolamento de tenant; 401 e 403) e `GetHistoryCampaign.cs` (histórico completo depois de criar, iniciar, pausar, editar, retomar e cancelar; isolamento de tenant).

### Frontend

- [X] T086 [P] [US3] Criar `frontend/business/application/dtos/response/campaignList.response.ts` e `campaignEvent.response.ts` (paginados por `createPaginatedResponseSchema`) e `ZCampaignListRequestSchema`; acrescentar `getAllCampaigns` e `getCampaignHistory` a `ICampaignService` e `campaign.service.ts`.
- [X] T087 [US3] Criar a página `frontend/src/pages/Campaigns/` (5 arquivos MVVM): lista com nome, segmento, localização, `statusBadge` e data, filtro por estado, scroll infinito por `useInfiniteScrollQuery` com sentinel por `IntersectionObserver`, estado vazio com a ação "Criar a primeira campanha", e acesso ao detalhe em até 3 interações; rota privada `campaigns: '/campaigns'` em `routePaths.ts`, `LazyImports/private.tsx` e `DataPaths/private.ts`.
- [X] T088 [P] [US3] Criar o componente `frontend/src/components/campaignHistory/` (MVVM, com lógica: carrega o histórico paginado) com story nos 5 estados, e incluí-lo na página `CampaignDetail`.
- [X] T089 [US3] Ligar a navegação: link "Campanhas" na `Home` (`frontend/src/pages/Home/Home.view.tsx`, via `RoutePaths.campaigns`) e, após salvar no `CampaignForm`, redirecionar para a lista.
- [X] T090 [P] [US3] Criar `frontend/tests/unit/pages/Campaigns/Campaigns.controller.test.tsx` (lista, filtro reinicia e cancela a requisição, vazio com ação de criar, erro na página 2 preserva itens, erros 401/500/rede), `frontend/tests/unit/components/campaignHistory/campaignHistory.controller.test.tsx` e os testes de service e DTO dos métodos novos.
- [X] T091 [P] [US3] Criar `frontend/tests/e2e/campaignList.spec.ts` (API mockada): lista vazia, lista com estados diferentes, filtro, abrir o detalhe e ver o histórico.
- [ ] T092 [US3] Validar a história: testes verdes e roteiro manual dos cenários 15 a 17 do `quickstart.md`.

**Checkpoint**: as três histórias funcionam de forma independente.

---

## Phase 6: Polish & Cross-Cutting

- [X] T093 [P] Atualizar `backend/README.md` (Campanhas, `ReferenceSeed`, seção `Campaign` do `appsettings.json`, só nomes) e `frontend/README.md` (marcar a pendência 5, `useInfiniteScrollQuery`, como feita; listar as páginas novas).
- [ ] T094 Executar o quickstart completo (`specs/001-campanhas/quickstart.md`), incluindo o teste de fumaça de concorrência, e registrar o resultado.
- [X] T095 Cobertura: `dotnet test ../PersonalProspec.slnx --collect:"XPlat Code Coverage"` e `npm run test:coverage`; atingir no mínimo 80% na funcionalidade nova de cada lado.
- [X] T096 Rodar `npm run format`, `npm run lint`, `npm run ts:check` e `npm run build` em `frontend`, e `dotnet build ../PersonalProspec.slnx` sem warnings novos em `backend/Src`.
- [X] T097 Varredura de segredo e de log: buscar nos arquivos criados qualquer valor de segredo, `Console.WriteLine` e `console.log` de payload e qualquer travessão (DOC-STYLE-001); confirmar que `appsettings*.json` só tem estrutura e valores de partida não secretos.
- [X] T098 Acionar o agente `back-architecture-auditor` e o `front-architecture-auditor` e corrigir toda violação reportada.
- [X] T099 Atualizar `docs/discovery/prototipo-vs-specs.md` com o que da spec 001 foi implementado e o que ainda diverge do protótipo; não editar o protótipo.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependência. T002 e T003 podem rodar em paralelo e bloqueiam T018, T022 e tudo que usa as listas de referência.
- **Foundational (Phase 2)**: depende do Setup e BLOQUEIA todas as histórias.
- **US1 (Phase 3)**: depende da Fundação. É o MVP.
- **US2 (Phase 4)**: depende da Fundação e reaproveita `CampaignCommandService`, `CampaignController`, `campaign.service.ts` e `CampaignForm` da US1; ordem recomendada P1, depois P2.
- **US3 (Phase 5)**: depende da Fundação; usa `CampaignQueryService` e `CampaignDetail` criados na US2 (T069 e T076), então vem depois da US2.
- **Polish (Phase 6)**: depende das histórias desejadas.

### Dentro da Fundação

- Domain (T005 a T015) antes de Infra (T016 a T023). T016 a T019 antes de T023 (migration); T023 antes de T022 e T033.
- T024 a T029 (ApplicationService) dependem do Domain; T030 registra tudo e vem por último na Api; T031 é independente.
- Frontend (T034 a T038) independente do backend.

### Dentro de cada história

- DTO e contratos, depois service, depois controller, depois testes de integração.
- Teste unitário de service pode correr em paralelo ao controller (arquivos diferentes).
- No frontend: DTO, interface, símbolo e container, service, componentes, página, rota, testes e e2e.

### Oportunidades de paralelismo

- Setup: T002 e T003.
- Fundação, Domain: T005 a T015 quase todos [P] (arquivos distintos). Infra: T016 a T018, T020 e T021 em paralelo. Frontend: T034 a T038 em paralelo.
- Cada história: DTOs, Builders e arquivos de teste distintos [P]. Backend e frontend de uma mesma história andam em paralelo depois de `contracts/api.md` estar fechado.
- US2: T064 a T068 e T071, T072 em paralelo (um arquivo por método e por endpoint).

### Exemplo paralelo: Fundação, Domain

```bash
Task: "Criar ECampaignStatus.cs em Src/PersonalProspec.Domain/Enums/ECampaignStatus.cs"
Task: "Criar Campaign.cs em Src/PersonalProspec.Domain/Entities/Campaign.cs"
Task: "Criar CampaignLocation.cs em Src/PersonalProspec.Domain/Entities/CampaignLocation.cs"
Task: "Criar CampaignCnae.cs em Src/PersonalProspec.Domain/Entities/CampaignCnae.cs"
Task: "Criar CampaignStateMachine.cs em Src/PersonalProspec.Domain/Handlers/CampaignSettings/CampaignStateMachine.cs"
```

---

## Implementation Strategy

### MVP primeiro (US1)

1. Phase 1: Setup (T001 a T004).
2. Phase 2: Fundação (T005 a T038), sem pular o checkpoint.
3. Phase 3: US1 (T039 a T057).
4. PARAR e VALIDAR: criar e salvar uma campanha completa, ver os erros de campo, voltar de etapa, dois cliques em "Salvar".
5. Só depois seguir para US2 e US3.

### Entrega incremental

1. Setup, Fundação, depois US1: campanha salva em Rascunho.
2. US2: iniciar, pausar, retomar, cancelar, editar e a tela "Agente de IA iniciado".
3. US3: lista, filtro e histórico.
4. Cada história acrescenta valor sem quebrar a anterior.

### Riscos para acompanhar

- **Lista de municípios (T002)**: a fonte ainda não está definida; se não for verificável, parar e perguntar ao Rafael antes de T007, T018 e T022.
- **Collation e busca sem acento (T021)**: confirmar a tradução do EF Core no teste de integração; se não traduzir, trocar por coluna normalizada.
- **Pesquisa real só na spec 003**: até lá "Em execução" não busca empresa nenhuma; o detalhe mostra "pesquisa ainda não executada".
- **Docker** é pré-requisito dos testes de integração (Testcontainers).
- **Valores de partida sem fonte** (`CampaignOptions`): o Rafael ajusta em `appsettings.json`.
