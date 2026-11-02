---

description: "Tarefas da spec 002: acesso e conta do usuário (Fundação da Fase 1)"
---

# Tasks: Acesso e conta do usuário

**Input**: `specs/002-acesso-conta/spec.md` e `plan.md`, mais `specs/000-plano-geral/{data-model.md, research.md, contracts/api.md, contracts/integracoes.md}`.

**Prerequisites**: plan.md e spec.md (presentes). Spikes S0.1 e S0.3 já executados (`docs/discovery/spikes-s0-1-e-s0-3.md`).

**Tests**: INCLUÍDOS. A constituição (princípio IV) exige teste na granularidade das rules: 1 arquivo por método de service, 1 por endpoint e Builder compartilhado no backend; Vitest por controller, service e slice no frontend.

**Organization**: Setup, Fundação (bloqueia as histórias), depois uma fase por história na ordem de prioridade da spec: US1 (entrar e sair, P1), US2 (removida em 2026-11-02), US3 (removida em 2026-11-02), e Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1, US2 ou US3, só nas fases de história
- Caminhos relativos à raiz do repositório. `Src` = `backend/Src`, `Tests` = `backend/Tests`. Comandos `dotnet` rodam a partir de `backend/Src`.

## Regras de execução (valem para todas as tarefas)

- Segredo nunca entra no repositório, em log, em resposta nem em mensagem de erro. Em docs e relatório só o NOME da chave. Chaves desta spec: `Pepper:Secret`, `JwtToken:JwtKey`, `Seed:Email`, `Seed:Password`. O Rafael grava os valores com `dotnet user-secrets set`; o agente nunca lê nem lista.
- Pacote novo, `dotnet restore`, `npm install` e commit só com pedido do Rafael.
- Namespaces: `PersonalProspec.<Camada>`. `sealed` por padrão, primary constructors, file-scoped namespaces. Datas só por `IClock`, nunca `DateTime.Now`.
- Valores de partida sem fonte estão em `plan.md` (tabela "Valores de partida"); ficam em `appsettings.json` e Options, nunca fixos no código.
- DOC-STYLE-001: nenhum travessão (U+2014) em código, comentário, doc ou mensagem.
- Todo controller de página trata 400 (mostra `error.messages`), 401, 500 e erro de rede, com mensagem genérica nos dois últimos; nunca stack trace cru na UI nem tela carregando para sempre.
- Mensagens ao usuário em pt-BR via `EMessage` (backend) e Zod/controller (frontend), nunca string solta na view.

---

## Phase 1: Setup (aprovações e linha de base)

**Purpose**: liberar o que depende do Rafael e provar que o esqueleto está verde antes de alterá-lo.

- [X] T001 Pedir ao Rafael: (a) aprovação para `dotnet restore`, `npm install` e para os pacotes de T002 e T003; (b) sigla do schema SQL: decidido manter `APP` (D7, em `Src/PersonalProspec.Infra/ORM/Mappings/Base/BaseMapping.cs`); (c) provedor de e-mail (D4): removido em 2026-11-02 junto com a recuperação de senha.
- [X] T002 [P] Em `Src/PersonalProspec.Infra/PersonalProspec.Infra.csproj`, após aprovação, adicionar `Konscious.Security.Cryptography.Argon2` 1.3.1 e `Microsoft.Extensions.Identity.Core` (versão 10.x a CONFERIR no NuGet; não consta nas notas e não pode ser assumida).
- [X] T003 [P] Em `Src/PersonalProspec.Api/PersonalProspec.Api.csproj`, após aprovação, adicionar `Microsoft.AspNetCore.Authentication.JwtBearer` 10.0.13.
- [X] T004 Registrar a linha de base verde: `dotnet build ../PersonalProspec.slnx` e `dotnet test ../PersonalProspec.slnx` em `backend/Src`; `npm run ts:check`, `npm run lint` e `npm run test:unit` em `frontend`. Anotar falhas pré-existentes antes de seguir.

---

## Phase 2: Foundational (bloqueia TODAS as histórias)

**Purpose**: Identity customizado, hash, JWT em cookie, CSRF, tenant, seed e infraestrutura de teste no backend; instância axios, sessão e módulo de acesso no frontend.

**CRITICAL**: nenhuma história começa antes do checkpoint desta fase.

### Domain

- [X] T005 [P] Criar `Src/PersonalProspec.Domain/UserPolicies/Policy.cs`: `public static class Policy { public const string Administrator = "Administrator"; }` (decisão A2: única role).
- [X] T006 [P] Criar `Src/PersonalProspec.Domain/Constants/SystemSeedId.cs` com duas constantes `Guid` fixas (gerar os valores uma vez): `BusinessUnitId` e `AdministratorRoleId`. Não existe tabela de unidade de negócio (premissa do plan.md).
- [X] T007 [P] Criar `Src/PersonalProspec.Domain/Constants/PasswordRules.cs` com `public const int MinLength = 8;` (fonte: nota `backend-seguranca-identity`; sem regra de composição, decisão deliberada do padrão).
- [X] T008 [P] Criar `Src/PersonalProspec.Domain/Enums/EEventCategory.cs` com `Auth, Campaign, Company, Task, Config, DataRemoval` (valores do `data-model.md`; `Message` e `Dispatch` ficam de fora, adiados).
- [X] T009 (removida em 2026-11-02: recuperação de senha fora do escopo; nada a fazer)
- [X] T010 [P] Criar `Src/PersonalProspec.Domain/Entities/Identity/Role.cs` (POCO, não herda tipo do Identity): `Id` (init), `Name`, `NormalizedName`.
- [X] T011 [P] Criar `Src/PersonalProspec.Domain/Entities/Identity/User.cs` (POCO, `ITenantOwned`, `sealed`): `Id` (init), `Email`, `NormalizedEmail`, `PasswordHash` ("senha com hash Argon2id"), `SecurityStamp`, `AccessFailedCount` ("contagem de falhas"), `LockoutEnd` (`Instant?`, "lockout"), `LockoutEnabled`, `RoleId`, `Role?`, `CreatedAt` (init, `Instant`), `BusinessUnitId` (init). Incluir só os campos que as interfaces de store usadas em T034 exigem.
- [X] T012 [P] Criar `Src/PersonalProspec.Domain/Entities/Identity/RefreshToken.cs` (`ITenantOwned`): `Id`, `UserId`, `TokenHash` ("hash do token"; o valor cru nunca é gravado), `ExpiresAt` ("validade"), `RevokedAt` (`Instant?`, "revogado"), `CreatedAt`, `BusinessUnitId`.
- [X] T013 (removida em 2026-11-02: recuperação de senha fora do escopo; nada a fazer)
- [X] T014 [P] Criar `Src/PersonalProspec.Domain/Entities/Event.cs` (`ITenantOwned`): `Id`, `Category` (`EEventCategory`), `Type` (texto), `CompanyId` e `CampaignId` (`Guid?`, sem chave estrangeira até as specs 007 e 001), `Description`, `Source`, `OccurredAt`, `BusinessUnitId`. Regra do `data-model.md`: nunca guarda senha nem segredo.
- [X] T015 [P] Criar `Src/PersonalProspec.Domain/ValueObjects/ArgonParameters.cs` (record com memória, iterações, paralelismo, tamanho do hash e do sal) e DEFINIR a versão 1 dos parâmetros citando a fonte (OWASP Password Storage Cheat Sheet) num comentário de uma linha. Não inventar valor: se a fonte não for verificável, parar e perguntar ao Rafael.
- [X] T016 [P] Criar `Src/PersonalProspec.Domain/Providers/PepperOptions.cs`: `SectionName = "Pepper"`, `required string Secret`, sem valor default.
- [X] T017 [P] Criar `Src/PersonalProspec.Domain/Providers/JwtTokenOptions.cs`: `SectionName = "JwtToken"`, `required string JwtKey` (segredo), `Issuer`, `Audience`, `AccessTokenMinutes`, `RefreshTokenMinutes` (única fonte de expiração, não duplicar número).
- [X] T018 (removida em 2026-11-02: recuperação de senha fora do escopo; nada a fazer)
- [X] T019 [P] Criar `Src/PersonalProspec.Domain/Providers/SeedOptions.cs`: `SectionName = "Seed"`, `required string Email`, `required string Password` (ambos segredo; decisão A1).
- [X] T020 [P] Em `Src/PersonalProspec.Domain/Handlers/NotificationSettings/EMessage.cs` acrescentar, mantendo os valores existentes (nunca renumerar), entradas com `[Description]` em pt-BR: `InvalidCredentials` ("E-mail ou senha inválidos."), `LockedOut` ("Muitas tentativas. Tente novamente em {0}."), `MinLength` ("O campo {0} exige no mínimo {1} caracteres.").
- [X] T021 [P] Criar `Src/PersonalProspec.Domain/Interfaces/RepositoryContracts/IRefreshTokenRepository.cs`: `SaveAsync`, `FindByPredicateAsync(predicate, include?, toQuery)`, `FindByTokenHashAsync(string hash)`, `RevokeAllByUserAsync(Guid userId, Instant now)` (via `ExecuteUpdateAsync`, atômico) e `RevokeByIdAsync(Guid id, Instant now)`. Os três últimos usam `IgnoreQueryFilters()`, porque `refresh_token` é anônimo e o tenant do contexto fica `Guid.Empty` (sem isso o filtro global faz a busca voltar vazia e o update afetar 0 linhas sem erro). O token é um segredo aleatório de 256 bits e único, que já protege a busca; o tenant é conferido depois com o usuário carregado.
- [X] T022 (removida em 2026-11-02: recuperação de senha fora do escopo; nada a fazer)
- [X] T023 [P] Criar `Src/PersonalProspec.Domain/Interfaces/RepositoryContracts/IEventRepository.cs`: `SaveAsync(Event)`.

### Infra

- [X] T024 Em `Src/PersonalProspec.Infra/ORM/Mappings/Base/BaseMapping.cs`, aplicar a sigla do schema confirmada em T001(b); sem resposta, manter `APP`.
- [X] T025 Criar o conversor `Src/PersonalProspec.Infra/ORM/Converters/InstantConverter.cs` (`Instant` <-> `DateTime` UTC) e registrá-lo em `ConfigureConventions` de `Src/PersonalProspec.Infra/ORM/Contexts/ApplicationContext.cs` (`Properties<Instant>().HaveConversion<InstantConverter>()` e a versão anulável). Sem pacote novo.
- [X] T026 [P] Criar `Src/PersonalProspec.Infra/ORM/Mappings/RoleMapping.cs` (`sealed`, herda `BaseMapping<Role>`; toda prop com `HasColumnType`, `HasColumnName` snake_case, `HasColumnOrder`, `IsRequired`; sem `HasQueryFilter`).
- [X] T027 [P] Criar `Src/PersonalProspec.Infra/ORM/Mappings/UserMapping.cs`: índice único em `normalized_email`; FK para `Role` com `DeleteBehavior.NoAction`; `business_unit_id` obrigatório.
- [X] T028 [P] Criar `Src/PersonalProspec.Infra/ORM/Mappings/RefreshTokenMapping.cs`: índice único em `token_hash`; FK para `User` com `NoAction`.
- [X] T029 (removida em 2026-11-02: recuperação de senha fora do escopo; nada a fazer)
- [X] T030 [P] Criar `Src/PersonalProspec.Infra/ORM/Mappings/EventMapping.cs`: índice `(company_id, occurred_at)` e `(campaign_id, occurred_at)` (índices de partida do `data-model.md`); `company_id` e `campaign_id` anuláveis, sem FK.
- [X] T031 [P] Criar `Src/PersonalProspec.Infra/Repositories/RefreshTokenRepository.cs` (`sealed`, herda `RepositoryBase<RefreshToken>`, implementa `IRefreshTokenRepository`).
- [X] T032 (removida em 2026-11-02: recuperação de senha fora do escopo; nada a fazer)
- [X] T033 [P] Criar `Src/PersonalProspec.Infra/Repositories/EventRepository.cs`.
- [X] T034 Criar `Src/PersonalProspec.Infra/Identity/UserStore.cs` implementando `IUserStore<User>`, `IUserPasswordStore<User>`, `IUserEmailStore<User>`, `IUserLockoutStore<User>`, `IUserRoleStore<User>` e `IUserSecurityStampStore<User>`, sobre `ApplicationContext`. TODA consulta de busca (por id, por e-mail normalizado) usa `.IgnoreQueryFilters()`, porque o login ainda não tem tenant. Nunca `IdentityDbContext`.
- [X] T035 [P] Criar `Src/PersonalProspec.Infra/Identity/RoleStore.cs` implementando `IRoleStore<Role>` (busca com `.IgnoreQueryFilters()`).
- [X] T036 Criar `Src/PersonalProspec.Infra/Identity/ArgonTwoPasswordHasher.cs`: `ArgonTwoPasswordHasher<TUser> : IPasswordHasher<TUser>`; Argon2id com pepper por HMAC-SHA256 (`PepperOptions.Secret`); a versão dos parâmetros (`ArgonParameters`, T015) vai num byte no início do hash; `VerifyHashedPassword` devolve `SuccessRehashNeeded` quando a versão do hash não é a atual; nunca remover versão antiga do mapa.
- [X] T037 Gerar a migration inicial: `dotnet ef migrations add InitialIdentity --project PersonalProspec.Infra --startup-project PersonalProspec.Api` (a partir de `backend/Src`; depende de T024 a T030 e da connection string em user-secrets). Conferir o SQL gerado: schema escolhido, índices únicos, sem `HasQueryFilter`. NÃO rodar `dotnet ef database update` contra HML/PRD.
- [X] T038 Criar `Src/PersonalProspec.Infra/ORM/Seeds/InitialSeed.cs`: idempotente; cria `Role` (`SystemSeedId.AdministratorRoleId`, `Policy.Administrator`) se não existir e, SE NÃO EXISTIR NENHUM `User`, cria a conta com `SeedOptions.Email` normalizado (minúsculas, sem espaços) e `SeedOptions.Password` passado por `IPasswordHasher<User>`, com `BusinessUnitId = SystemSeedId.BusinessUnitId`, `SecurityStamp` novo e `CreatedAt` por `IClock`. Nunca registrar o e-mail nem a senha em log.
- [X] T039 Em `Src/PersonalProspec.Api/Settings/Handlers/MigrationHandlerSettings.cs`, chamar `InitialSeed` depois de `MigrateAsync()` e remover o comentário PENDENTE do seed.

### ApplicationService

- [X] T040 [P] Criar `Src/PersonalProspec.ApplicationService/Traces/AuthenticationTrace.cs` (`static class` com `const string`): `Login`, `Logout`, `RefreshToken`, `GetSession`.
- [X] T041 [P] Criar `Src/PersonalProspec.ApplicationService/Interfaces/ServiceContracts/IAuthCookieHandler.cs`: `SetSession(string accessToken, string refreshToken)`, `ClearSession()`, `string? GetRefreshToken()`. Implementação na Api (T055).
- [X] T042 [P] Criar `Src/PersonalProspec.ApplicationService/Interfaces/ServiceContracts/IJwtTokenService.cs`: `string CreateAccessToken(User user)` e `(string raw, string hash) CreateRefreshToken()` (valor cru para o cookie, hash para o banco). Implementação na Api (T056).
- [X] T043 Criar `Src/PersonalProspec.ApplicationService/Services/AuthenticationServices/AuthEventRecorder.cs` (`sealed`, usa `IEventRepository` e `IClock`): `RecordAsync(string type, Guid businessUnitId, string description)` grava `Event` com `Category = Auth` e `Source = "Authentication"`. A descrição nunca contém senha, token nem link. Tipos: `LoginSucceeded`, `LoginFailed`, `LoginLockedOut`, `Logout`.

### Api (segurança e pipeline)

- [X] T044 Em `Src/PersonalProspec.Api/Settings/Handlers/ProviderSettings.cs`, registrar com `SetConfigureOptionsWithValidation` (`ValidateOnStart`): `PepperOptions` (Secret não vazio), `JwtTokenOptions` (JwtKey com tamanho mínimo exigido pelo algoritmo escolhido, expirações positivas), `SeedOptions` (Email e Password não vazios; mensagem sem valor).
- [X] T045 [P] Criar `Src/PersonalProspec.Api/Settings/Handlers/IdentitySettings.cs`: `AddIdentityCore<User>()` com `AddUserStore<UserStore>()` e `AddRoleStore<RoleStore>()`, `Password.RequiredLength = PasswordRules.MinLength`, todas as exigências de composição DESLIGADAS, `Lockout` com 5 tentativas e 5 minutos, `User.RequireUniqueEmail = true`; registrar `IPasswordHasher<User>` como `ArgonTwoPasswordHasher<User>`.
- [X] T046 [P] Criar `Src/PersonalProspec.Api/Settings/Handlers/AuthenticationSettings.cs`: JwtBearer com `ValidateIssuerSigningKey`, issuer, audience e lifetime; token lido do cookie de acesso em `OnMessageReceived`; em `OnTokenValidated`, comparar o claim de `SecurityStamp` com o do usuário no banco (consulta com `IgnoreQueryFilters`) e falhar se diferir (decisão aprovada, ver Clarifications do plan.md, garante FR-007). Validar por `ValidateToken`, nunca só `ReadJwtToken`.
- [X] T047 [P] Criar `Src/PersonalProspec.Api/Settings/Handlers/AuthorizationSettings.cs` com `AddAuthorizationBuilder()`, a policy `Policy.Administrator` e `FallbackPolicy` exigindo usuário autenticado (uma action sem atributo nunca fica pública por esquecimento). Criar também `Tests/PersonalProspec.ArchitectureTest/ArchTests/ControllerAuthorizationTests.cs`: por reflection, toda action de todo controller tem `[Authorize]` ou `[AllowAnonymous]` explícito.
- [X] T048 [P] Criar `Src/PersonalProspec.Api/Settings/Handlers/RateLimitingSettings.cs`: constante `LimitingByUser`; limitador por janela fixa de 60 requisições por minuto (valor de partida em Options, não fixo), particionado pelo id do usuário autenticado e, sem autenticação, pelo IP.
- [X] T049 [P] Criar `Src/PersonalProspec.Api/Settings/Handlers/CorsSettings.cs`: origens permitidas lidas de `Cors:AllowedOrigins` (não é segredo); sem origem configurada, CORS fica restrito (em dev o Vite faz proxy de `/api`, mesma origem); `AllowCredentials` só com origem explícita, nunca curinga.
- [X] T050 [P] Criar `Src/PersonalProspec.Api/Settings/Handlers/AntyCsrfSettings.cs`: `AddAntiforgery` com `HeaderName = "X-CSRF-TOKEN"`.
- [X] T051 [P] Criar `Src/PersonalProspec.Api/Middlewares/CsrfValidationMiddleware.cs`: Synchronizer Token via `IAntiforgery`; ignora métodos seguros (GET, HEAD, OPTIONS, TRACE) e endpoints com `[AllowAnonymous]`; token ausente ou inválido responde 400 com notification, sem detalhe técnico.
- [X] T052 [P] Criar `Src/PersonalProspec.Api/Middlewares/TenantContextMiddleware.cs`: lê o claim `CustomClaim.BusinessUnit` e preenche `ICurrentTenantContext`; serviço scoped injetado no `InvokeAsync`, nunca no construtor.
- [X] T053 [P] Criar `Src/PersonalProspec.Api/Extensions/ClaimsPrincipalExtension.cs` com `User.GetBusinessUnitId()` e `User.GetUserId()` (claim `NameIdentifier`) (extension members do C# 14), devolvendo `Guid.Empty` se o claim faltar.
- [X] T054 Em `Src/PersonalProspec.Api/Filters/UnitOfWorkFilter.cs`, implementar o desvio de login: `IsAuthenticationEndPoint(routeName)` para `generate_access_token` e `LoginMethod` que faz commit SEM olhar notification (senão o lockout e o evento de falha nunca persistem); remover o comentário PENDENTE. Os demais endpoints seguem `OthersMethods`.
- [X] T055 [P] Criar `Src/PersonalProspec.Api/Handlers/AuthCookieHandler.cs` implementando `IAuthCookieHandler`: cookie de acesso e de refresh com `HttpOnly`, `Secure`, `SameSite=Strict`; cookie de refresh com `Path` restrito ao endpoint `api/Authentication/refresh_token`; validade vinda de `JwtTokenOptions`; `ClearSession` apaga os dois com os mesmos atributos. Token nunca vai no corpo da resposta.
- [X] T056 [P] Criar `Src/PersonalProspec.Api/Handlers/JwtTokenService.cs` implementando `IJwtTokenService`: claims `NameIdentifier`, `Email`, `Role` (`Policy.Administrator`), `CustomClaim.BusinessUnit` e o de `SecurityStamp`; refresh token aleatório criptográfico (cru) com hash SHA-256 (hex); expirações de `JwtTokenOptions` e `IClock`.
- [X] T057 Criar `Src/PersonalProspec.Api/IoC/Containers/AuthenticationContainer.cs` registrando `IAuthCookieHandler`, `IJwtTokenService` e `IHttpContextAccessor`, e chamá-lo em `Src/PersonalProspec.Api/IoC/InversionOfControlHandler.cs`. Registrar também em `Src/PersonalProspec.Api/IoC/Containers/RepositoryContainer.cs` os repositórios T031 a T033.
- [X] T058 Em `Src/PersonalProspec.Api/Settings/SettingsControl.cs`, chamar `AddIdentitySettings`, `AddAuthenticationSettings`, `AddAuthorizationSettings`, `AddRateLimitingSettings`, `AddCorsSettings` e `AddAntyCsrfSettings`, e remover o comentário PENDENTE.
- [X] T059 Em `Src/PersonalProspec.Api/Settings/EcosystemInitiation.cs`, montar o pipeline na ordem exigida pelo padrão: `UseHttpsRedirection`, CSRF, CORS, RateLimiter, Authentication, Authorization, `TenantContextMiddleware`, `MapControllers`; remover o PENDENTE. O CSRF vem ANTES de CORS, RateLimiter e Authentication. Acrescentar `UseExceptionHandler` com o middleware novo `Src/PersonalProspec.Api/Middlewares/GlobalExceptionMiddleware.cs`: responde 500 com notification genérica, sem stack trace nem mensagem da exceção (inclusive em Development), e registra só tipo, rota e correlation id, nunca o corpo da requisição (FR-011, SC-005). `MapHealthChecks("/health")` e, só em Development, OpenAPI e Scalar ficam com `.AllowAnonymous()` explícito.
- [X] T060 Em `Src/PersonalProspec.Api/appsettings.json`, acrescentar só a ESTRUTURA (segredos com `""`): `Pepper:Secret`, `JwtToken` (`JwtKey`, `Issuer`, `Audience`, `AccessTokenMinutes`, `RefreshTokenMinutes`), `Seed` (`Email`, `Password`) e `Cors:AllowedOrigins`. Valores não secretos de partida conforme `plan.md`. Nenhum valor real.
- [X] T061 Criar `Src/PersonalProspec.Api/Controllers/AntiforgeryController.cs` (`sealed`, `[AllowAnonymous]`, `[EnableRateLimiting(RateLimitingSettings.LimitingByUser)]`): `GET api/Antiforgery/token` devolve o token de requisição (`IAntiforgery.GetAndStoreTokens`), `[ProducesResponseType]` completo.

### Backend, infraestrutura de teste (pendência 10)

- [X] T062 [P] Criar `Tests/PersonalProspec.IntegrationTest/Settings/DatabaseFixture.cs`: contêiner SQL Server por Testcontainers (imagem `rapidfort/microsoft-sql-server-2019-ib`, porque a rede corporativa bloqueia o MCR), migrations aplicadas, seed validado com consulta real (falha rápida com mensagem clara), Respawn entre testes preservando só tabelas semeadas imutáveis (`Role`); `User` NÃO é preservada e o seed da conta de teste é reaplicado a cada teste, para o bloqueio por tentativas não vazar entre testes.
- [X] T063 [P] Criar `Tests/PersonalProspec.IntegrationTest/Settings/TestAuthHandler.cs` (claims por headers `X-Test-*`, incluindo role e `BusinessUnit`).
- [X] T064 [P] Criar `Tests/PersonalProspec.IntegrationTest/Settings/Seeds/SystemSeedIdTools.cs` expondo `SystemSeedId.BusinessUnitId` e as credenciais FALSAS do usuário de teste (valores fictícios, nunca segredo real).
- [X] T065 Criar `Tests/PersonalProspec.IntegrationTest/Settings/CustomWebApplicationFactory.cs` (`WebApplicationFactory<Program>`): configuração em memória com Options falsas (`Pepper:Secret`, `JwtToken:*`, `Seed:*`) e rate limit neutralizado.
- [X] T066 Criar `Tests/PersonalProspec.IntegrationTest/Settings/IntegrationTestBase.cs` com `CreateAuthenticatedClientWithCsrfAsync(string role)` (CSRF exercitado de verdade: `GET api/Antiforgery/token` e header `X-CSRF-TOKEN`) e `CreateAnonymousClientWithCsrfAsync()`.

### Frontend (instância, sessão e acesso)

- [X] T067 [P] Em `frontend/business/api/api.controllers.ts`, adicionar `Authentication: 'Authentication'` e `Antiforgery: 'Antiforgery'` ao objeto `ApiControllers`.
- [X] T068 [P] Criar `frontend/axios/middlewares/correlationIdHandler.ts`: interceptor de requisição que gera um id (`crypto.randomUUID()`) e envia no header `X-Correlation-Id` (nome de partida; o backend ainda não o consome).
- [X] T069 [P] Criar `frontend/axios/middlewares/loggingHandler.ts`: loga método, URL (sem query) e status pelo `ILogger`; NUNCA payload, cookie nem header de autorização.
- [X] T070 [P] Criar `frontend/axios/antiforgery/fetchCsrfToken.ts`: `GET` em `Antiforgery/token` pela instância `http`, valida com Zod e despacha `setCsrfToken`; usada só no bootstrap de sessão.
- [X] T071 [P] Criar `frontend/axios/middlewares/csrfHandlerMiddleware.ts`: em requisições de escrita (POST, PUT, DELETE, PATCH) injeta `X-CSRF-TOKEN` lendo `selectCsrfToken` da store.
- [X] T072 [P] Criar `frontend/axios/middlewares/messageHandlerMiddlware.ts` (grafia do padrão): interceptor de resposta que converte erro 400 (lista de notifications `{ key, message }`) em `ApiError` (`messages: string[]`, `status`) e mantém os demais erros como estão; não há biblioteca de toast, então a tela exibe `error.messages` (toast fica para depois).
- [X] T073 [P] Criar `frontend/axios/middlewares/sessionHandlerMiddleware.ts`: em 401 sem `_skipAuthRedirect` na config, despacha `clearSession` e `clearUser`; em resposta 2xx de `Authentication/generate_access_token`, despacha `markSessionBootstrapped`.
- [X] T074 Criar `frontend/axios/middlewares/cookieSessionRefreshMiddleware.ts`: em 401, exceto nas rotas de autenticação, faz UMA chamada a `Authentication/refresh_token` com `_skipAuthRedirect` e reexecuta a requisição original; refresh concorrente é compartilhado (uma promise só); falha do refresh deixa o 401 seguir para o `sessionHandlerMiddleware`. Nunca reimplementar refresh em Service.
- [X] T075 Em `frontend/axios/axios.instance.ts`, ligar a cadeia na ordem `correlationIdHandler`, `loggingHandler`, `csrfHandlerMiddleware`, `cookieSessionRefreshMiddleware`, `messageHandlerMiddlware`, `sessionHandlerMiddleware` (depende de T068 a T074) e remover o comentário PENDENTE.
- [X] T076 [P] Criar `frontend/src/stores/reducers/user/userSlice.ts` (`createSlice`): `user: { email: string } | null`, ações `setUser` e `clearUser`, seletor `selectUser`; registrar em `frontend/src/stores/combineReducers.ts`. Dado global de sessão, passa no checklist de `redux-toolkit.md`.
- [X] T077 [P] Criar `frontend/src/access/types/access.types.ts` (`AccessContext` com `isAuthenticated`) e `frontend/src/access/types/permissionKeys.ts` (`PermissionKeys` com os grupos `menu` e `feature` vazios, preenchidos pelas specs seguintes).
- [X] T078 [P] Criar `frontend/src/access/policies/accessPolicy.types.ts`, `accessPolicyBuilder.ts` (`AccessPolicyBuilder` fluente, só `authenticatedOnly()` por enquanto), `evaluateAccessPolicy.ts`, `accessPresets.ts` (preset `AccessPresets.authenticated`) e `permissionMatrix.ts` (`MENU_ACCESS_RULES` e regra de rota usando o preset).
- [X] T079 Criar `frontend/src/access/core/buildAccessContext.ts` e `AccessControl.ts` (`createAccessControl(context): IAccessControl`), e `frontend/src/access/handlers/RouteAccessHandler.ts`, `MenuAccessHandler.ts`, `FeatureAccessHandler.ts` (`canAccessRoute`, `canShowMenuItem`, `canUseFeature`), cada um delegando a `evaluateAccessPolicy`.
- [X] T080 Criar `frontend/src/access/hooks/useAccessControl.ts`: lê `selectUser` da store, memoiza o `IAccessControl` e devolve `{ canAccessRoute, canShowMenuItem, canUseFeature }`.

### Testes da Fundação

- [X] T081 [P] Criar `Tests/PersonalProspec.UnitTest/Domain/Constants/PasswordRulesTests.cs` e `Tests/PersonalProspec.UnitTest/Domain/Handlers/NotificationSettings/EMessageAuthTests.cs` (cada entrada nova tem descrição não vazia e `FormatTo` preenche os marcadores).
- [X] T082 [P] Criar `Tests/PersonalProspec.UnitTest/Infra/Identity/ArgonTwoPasswordHasherTests.cs`: hash difere do texto; verificar senha correta e errada; hash da mesma senha difere entre chamadas (sal); pepper diferente falha a verificação; hash de versão antiga devolve `SuccessRehashNeeded`.
- [X] T083 [P] Criar `Tests/PersonalProspec.UnitTest/Api/Middlewares/CsrfValidationMiddlewareTests.cs` (GET passa; POST sem token recusado; POST com token válido passa; `[AllowAnonymous]` ignorado) e `TenantContextMiddlewareTests.cs` (claim presente preenche o contexto; ausente deixa vazio), mais `GlobalExceptionMiddlewareTests.cs` (exceção não vaza texto nem stack trace; resposta 500 genérica; log sem corpo da requisição).
- [X] T084 [P] Criar `Tests/PersonalProspec.UnitTest/Api/Handlers/AuthCookieHandlerTests.cs` (atributos `HttpOnly`, `Secure`, `SameSite=Strict`, `Path` do refresh, apagar) e `JwtTokenServiceTests.cs` (claims esperados, expiração, hash do refresh diferente do cru).
- [X] T085 [P] Criar `Tests/PersonalProspec.UnitTest/Infra/ORM/Seeds/InitialSeedTests.cs`: cria role e conta quando vazio; idempotente na segunda execução; não cria segunda conta; e-mail normalizado; senha nunca aparece em log (com `ILogger` falso).
- [X] T086 [P] Criar `frontend/tests/unit/axios/middlewares/csrfHandlerMiddleware.test.ts`, `sessionHandlerMiddleware.test.ts`, `cookieSessionRefreshMiddleware.test.ts` (um refresh para N 401 simultâneos; sem laço em falha), `messageHandlerMiddlware.test.ts` e `loggingHandler.test.ts` (sem payload no log), espelhando `axios/`.
- [X] T087 [P] Criar `frontend/tests/unit/stores/reducers/user/userSlice.test.ts` e `frontend/tests/unit/access/policies/evaluateAccessPolicy.test.ts` e `frontend/tests/unit/access/hooks/useAccessControl.test.tsx` (autenticado acessa; sem usuário não acessa).
- [X] T088 Rodar `dotnet build ../PersonalProspec.slnx` e `dotnet test ../PersonalProspec.slnx` (incluindo `PersonalProspec.ArchitectureTest`, que deve continuar verde) e `npm run ts:check`, `npm run lint`, `npm run test:unit`. Corrigir tudo antes do checkpoint.

**Checkpoint**: Fundação pronta. As histórias podem começar.

---

## Phase 3: User Story 1 - Entrar e sair do sistema (Priority: P1) MVP

**Goal**: o usuário entra com e-mail e senha, permanece autenticado enquanto a sessão for válida, sai quando quiser, e rota interna sem sessão leva ao login.

**Independent Test**: abrir uma página interna sem entrar (redireciona ao login), entrar com credenciais corretas, ver o estado da sessão e sair; errar a senha e ver a mensagem genérica; errar 5 vezes e ver o bloqueio com o tempo de espera (spec 002, cenários 1 a 4 e edge cases de bloqueio e de e-mail normalizado).

### Backend

- [X] T089 [P] [US1] Criar `Src/PersonalProspec.ApplicationService/Dtos/AuthenticationDtos/Request/LoginRequest.cs` (`sealed record`, Request com `set`): `required string Email`, `required string Password`.
- [X] T090 [P] [US1] Criar `Src/PersonalProspec.ApplicationService/Dtos/AuthenticationDtos/Response/SessionResponse.cs` (`sealed record`, Response com `init`): `required string Email`.
- [X] T091 [P] [US1] Criar `Src/PersonalProspec.ApplicationService/Interfaces/ServiceContracts/IAuthenticationCommandService.cs` com `Task<bool> LoginAsync(LoginRequest request)`, `Task<bool> LogoutAsync(Guid userId, Guid businessUnitId)` e `Task<bool> RefreshTokenAsync()`; e `IAuthenticationQueryService.cs` com `Task<SessionResponse?> GetSessionAsync(Guid userId, Guid businessUnitId)`.
- [X] T092 [US1] Criar `Src/PersonalProspec.ApplicationService/Services/AuthenticationServices/AuthenticationCommandService.cs` (`sealed`, herda `ServiceBase`) com `LoginAsync`: normalizar o e-mail (`Trim` e minúsculas); campo vazio ou conta inexistente ou senha errada devolvem a MESMA notification `EMessage.InvalidCredentials` (chave `AuthenticationTrace.Login`) e executam um `VerifyHashedPassword` de custo equivalente mesmo sem conta (evita enumeração por tempo); senha errada incrementa a contagem de falhas e, ao atingir o limite, aplica o bloqueio; conta bloqueada devolve `EMessage.LockedOut` com o tempo restante (por `IClock`); sucesso zera a contagem, gera access e refresh token (`IJwtTokenService`), grava o `RefreshToken` só com o hash, escreve os cookies por `IAuthCookieHandler` e registra o evento por `AuthEventRecorder` (`LoginSucceeded`, `LoginFailed` ou `LoginLockedOut`). Depende de T034, T036, T041 a T043, T089.
- [X] T093 [US1] No mesmo arquivo, `LogoutAsync`: revogar TODOS os refresh tokens do usuário autenticado (`RevokeAllByUserAsync`; o cookie de refresh tem `Path` restrito e o navegador não o envia ao logout), apagar os cookies por `ClearSession`, registrar `Logout` e devolver `true`. E `RefreshTokenAsync`: ler o refresh do cookie, achar por `FindByTokenHashAsync` (T021), recusar se inexistente, expirado ou já revogado (token revogado reutilizado revoga TODOS os do usuário e registra evento), conferir o `SecurityStamp`, rotacionar (revogar o atual e emitir novo par) e reescrever os cookies; falha devolve notification genérica sem detalhe.
- [X] T094 [US1] Criar `Src/PersonalProspec.ApplicationService/Services/AuthenticationServices/AuthenticationQueryService.cs` (`sealed`, não herda `ServiceBase`) com `GetSessionAsync(userId, businessUnitId)`: busca o usuário pelo `UserManager` (que ignora o filtro de tenant) e devolve `null` se `user.BusinessUnitId != businessUnitId`; devolve `SessionResponse` do usuário ou `null`, mesma resposta para "não existe" e "de outro tenant" (o `businessUnitId` entra na decisão, como manda a constituição).
- [X] T095 [US1] Registrar `IAuthenticationCommandService`, `IAuthenticationQueryService` e `AuthEventRecorder` (T043) em `Src/PersonalProspec.Api/IoC/Containers/ServiceContainer.cs`.
- [X] T096 [US1] Criar `Src/PersonalProspec.Api/Controllers/AuthenticationController.cs` (`sealed`, `[ApiController]`, `[Route("api/[controller]")]`, primary constructor com os dois services, expression body, zero lógica) com: `POST generate_access_token` (`[AllowAnonymous]`), `POST logout` (`[Authorize(Roles = Policy.Administrator)]`), `POST refresh_token` (`[AllowAnonymous]`, o refresh vem do cookie) e `GET get_session` (`[Authorize(Roles = Policy.Administrator)]`, usa `User.GetBusinessUnitId()` e o id do usuário do claim). Todas com `[EnableRateLimiting(RateLimitingSettings.LimitingByUser)]` e `[ProducesResponseType]` para 200, 400, 401, 403 e 500. Rotas conforme `contracts/api.md`.

### Backend, testes

- [X] T097 [P] [US1] Criar `Tests/PersonalProspec.UnitTest/Builders/UserBuilderTest.cs`, `RefreshTokenBuilderTest.cs` e `LoginRequestBuilderTest.cs` (`NewObject()`, `WithXxx()`, `Build()`).
- [X] T098 [P] [US1] Criar `Tests/PersonalProspec.UnitTest/ApplicationService/Services/AuthenticationServices/Base/AuthenticationCommandServiceSetup.cs` e `AuthenticationQueryServiceSetup.cs` (Moq nas dependências).
- [X] T099 [P] [US1] Criar `.../AuthenticationServices/LoginAsyncTests.cs`: sucesso grava só o hash do refresh e escreve cookies; e-mail com maiúsculas e espaços é normalizado; senha errada, e-mail inexistente e campo vazio produzem a MESMA notification; quinta falha bloqueia; bloqueado informa o tempo; sucesso zera falhas; evento registrado sem senha.
- [X] T100 [P] [US1] Criar `.../AuthenticationServices/LogoutAsyncTests.cs` (revoga e apaga cookies; sem cookie ainda apaga) e `RefreshTokenAsyncTests.cs` (rotação; expirado, revogado e inexistente recusados; reuso de revogado revoga todos; `SecurityStamp` diferente recusa).
- [X] T101 [P] [US1] Criar `.../AuthenticationServices/GetSessionAsyncTests.cs` (existe devolve e-mail; inexistente e de outro tenant devolvem `null` igual).
- [X] T102 [P] [US1] Criar `Tests/PersonalProspec.UnitTest/Api/Controllers/AuthenticationControllerTests/` com `Base/AuthenticationControllerSetup.cs` e um arquivo por endpoint desta história: `GenerateAccessTokenTests.cs`, `LogoutTests.cs`, `RefreshTokenTests.cs`, `GetSessionTests.cs` (metadata por reflection: `[AllowAnonymous]` ou `[Authorize(Roles)]`, `[EnableRateLimiting]`, rota e verbo).
- [X] T103 [P] [US1] Criar `Tests/PersonalProspec.UnitTest/Api/Controllers/AntiforgeryControllerTests/GetTokenTests.cs` (anônimo, rate limit, rota).
- [X] T104 [US1] Criar `Tests/PersonalProspec.IntegrationTest/Executions/AuthenticationControllerTests/GenerateAccessToken.cs`: caminho feliz (cookies `HttpOnly`, `Secure`, `SameSite=Strict`, nenhum token no corpo); senha errada e e-mail inexistente devolvem corpo idêntico; 5 falhas bloqueiam e o bloqueio persiste (valida o desvio do `UnitOfWorkFilter`); login anônimo funciona SEM CSRF (regra do padrão: `[AllowAnonymous]` ignora o CSRF); evento `Auth` gravado sem senha.
- [X] T105 [P] [US1] Criar `.../AuthenticationControllerTests/Logout.cs` (cookies apagados, refresh revogado, 401 sem sessão) e `RefreshToken.cs` (rotação, reuso de refresh revogado recusado e revoga os demais, refresh de outra unidade de negócio inutilizável). Logout ainda cobre: POST sem CSRF recusado (endpoint autenticado exige CSRF), 403 com role sem permissão via `TestAuthHandler` e claim de outra unidade de negócio que não revoga nem apaga nada de outro usuário. O update de revogação deve afetar exatamente 1 linha (a sessão antiga fica inválida), o que valida a correção de tenant das rotas anônimas (ver T021).
- [X] T106 [P] [US1] Criar `.../AuthenticationControllerTests/GetSession.cs` (200 com e-mail; 401 sem cookie; 403 com role sem permissão via `TestAuthHandler`; usuário de outro tenant não é devolvido) e `Tests/PersonalProspec.IntegrationTest/Executions/AntiforgeryControllerTests/GetToken.cs`.

### Frontend

- [X] T107 [P] [US1] Criar `frontend/business/application/dtos/request/login.request.ts`: `ZLoginRequestSchema` (`email` com `trim`, minúsculas e formato de e-mail; `password` com `min(1)`) e `TLoginRequest = z.infer<...>`.
- [X] T108 [P] [US1] Criar `frontend/business/application/dtos/response/session.response.ts`: `ZSessionResponseSchema` (`email: string`) e `TSessionResponse`.
- [X] T109 [P] [US1] Criar `frontend/business/application/interfaces/authentication.interface.ts` com `IAuthenticationService`: `login(request, options?)`, `logout(options?)`, `getSession(options?)`, todos com `{ signal?: AbortSignal }` opcional.
- [X] T110 [P] [US1] Criar `frontend/business/core/ioc/references/authentication.symbols.ts` (`AuthenticationServiceSymbol = Symbol.for('AuthenticationService')`).
- [X] T111 [US1] Criar `frontend/business/application/service/authentication.service.ts` (`@injectable()`, `extends BaseService`, `implements IAuthenticationService`): `login` e `logout` pelo `this.execute(..., { rethrow: true })` e `buildPath(ApiControllers.Authentication, 'generate_access_token' | 'logout')`; `getSession` com `validateResponse(ZSessionResponseSchema, ...)` e `_skipAuthRedirect`, devolvendo `null` em 401; `login` também com `_skipAuthRedirect`.
- [X] T112 [US1] Criar `frontend/business/core/ioc/containers/authentication.container.ts` (`loadAuthenticationContainer`) e agregá-lo em `frontend/business/core/ioc/loadContainers.ts`.
- [X] T113 [US1] Criar `frontend/src/hooks/useSessionBootstrap.ts` (recebe o service e o `dispatch` por parâmetro): `fetchCsrfToken`, depois `getSession`, despacha `setUser` ou `clearUser` e por fim `markSessionBootstrapped`; sem laço de repetição em falha. Expõe a função de bootstrap para o Login reutilizá-la logo após o login (o token de antiforgery é gerado sem amarração ao usuário, então vale antes e depois do login; refazer o bootstrap após o login continua sendo o jeito de carregar a sessão).
- [X] T114 [US1] Em `frontend/src/routes/routePaths.ts`, definir `login: '/'`, `home: '/home'` (Home deixa de ser pública). Em `frontend/src/routes/LazyImports/public.tsx` trocar `Home` por `Login`, e em `LazyImports/private.tsx` registrar `Home`; ajustar `DataPaths/public.tsx` e `DataPaths/private.ts`; atualizar `frontend/tests/unit/pages/Home/Home.controller.test.tsx` se a rota mudar o comportamento testado.
- [X] T115 [US1] Criar `frontend/src/components/appHeader/` com os arquivos MVVM (componente com lógica: sair): `AppHeader.tsx`, `appHeader.controller.tsx` (chama `logout`, despacha `clearSession` e `clearUser`, navega para `RoutePaths.login`), `appHeader.view.tsx` (e-mail do usuário e botão "Sair", cada um com `data-testid`), `appHeader.types.tsx`, `appHeader.styles.ts` (só tokens de `colors` e `theme`, `focusRing`, estados `:hover`, `:active` e `:disabled`) e `appHeader.stories.tsx` com os estados default, loading, empty, error e disabled.
- [X] T116 [US1] Depois de T114 (`RoutePaths`) e T115 (`AppHeader`), reescrever `frontend/src/routes/AuthRequiredRoutes.tsx` conforme `react-router.md`: `useInjection` do service, `useSessionBootstrap` se ainda não bootstrapada, `Loading` enquanto bootstrapa, redireciona para `RoutePaths.login` sem usuário, `canAccessRoute(location.pathname)` redireciona para `RoutePaths.home` se negado, só então `<AppHeader />` e `<Outlet />`. Remover o aviso FAIL-CLOSED.
- [X] T117 [US1] Criar a página `frontend/src/pages/Login/` (5 arquivos MVVM): `Login.tsx` (`useInjection`, `useNavigate`, chama o controller), `Login.controller.tsx` (`UseLoginController`, sem JSX; `react-hook-form` com `zodResolver(ZLoginRequestSchema)`; submit chama `login`, em sucesso busca a sessão, despacha `setUser` e navega para `RoutePaths.home`; erro 400 mostra `error.messages` e erro 500 ou de rede mostra mensagem genérica; botão desabilitado em `isSubmitting`), `Login.view.tsx` (puro, `data-testid` em campos e botão) (o link "Esqueci a senha" entra na T136), `Login.types.tsx` (`ILoginControllerDeps`, `ILoginController`, `ILoginViewProps`), `login.styles.ts` (só tokens). Mensagem de erro por `errors.campo?.message`, nunca string fixa na view.
- [X] T118 [P] [US1] Criar `frontend/tests/unit/business/application/service/authentication.service.test.ts` (login e logout rejeitam em erro; `getSession` valida o Zod e devolve `null` em 401; `signal` respeitado), `frontend/tests/unit/business/application/dtos/login.request.test.ts` (e-mail normalizado, senha vazia recusada) e `frontend/tests/unit/hooks/useSessionBootstrap.test.ts`.
- [X] T119 [P] [US1] Criar `frontend/tests/unit/pages/Login/Login.controller.test.tsx` (mock só na fronteira do Service: sucesso navega; 400 mostra mensagens; duplo clique em enviar chama `login` uma vez; erro 500 e erro de rede mostram mensagem genérica; erro não deixa a tela carregando) e `frontend/tests/unit/components/appHeader/appHeader.controller.test.tsx` (sair limpa sessão e navega).
- [X] T120 [P] [US1] Criar `frontend/tests/unit/routes/AuthRequiredRoutes.test.tsx`: sem usuário vai ao login; com usuário renderiza o `Outlet`; bootstrap mostra `Loading`; rota negada vai para `home`.
- [X] T121 [US1] Criar `frontend/tests/e2e/login.spec.ts` (Playwright, API mockada): rota interna sem sessão redireciona; login correto chega à Home; senha errada mostra a mensagem genérica; sair volta ao login. E `frontend/tests/e2e/login.real-api.spec.ts` marcado `@real-api`, lendo as credenciais das variáveis de ambiente `E2E_EMAIL` e `E2E_PASSWORD` (nunca no repositório).
- [ ] T122 [US1] Validar a história: rodar `dotnet test`, `npm run test:unit`, `npm run test:e2e` e executar à mão o roteiro 1 do `specs/000-plano-geral/quickstart.md` (entrar, sair, errar a senha 5 vezes), com a API local e o Seed rodados.

**Checkpoint**: US1 funcional e testável sozinha. É o MVP da spec 002.

---

## Phase 4: User Story 2 (removida em 2026-11-02)

A recuperação de senha por e-mail saiu do escopo por decisão do Rafael. As tasks T123 a T141 foram apagadas; os números não foram reaproveitados.

---

## Phase 5: User Story 3 (removida em 2026-11-02)

A troca de senha saiu do escopo por decisão do Rafael. As tasks T142 a T150 foram apagadas; os números não foram reaproveitados.

---

## Phase 6: Polish & Cross-Cutting

- [ ] T151 [P] Atualizar `backend/README.md`: marcar as pendências 1 a 10, 13, 15 e 16 como feitas (ou o que de fato foi concluído), listar só os NOMES das chaves de user-secrets desta spec e o passo "gravar `Seed:Email` e `Seed:Password` antes da primeira subida". Atualizar `frontend/README.md` (pendências 1 a 3).
- [ ] T152 [P] Remover os comentários `PENDENTE` obsoletos em `Src/PersonalProspec.Api/Settings/SettingsControl.cs`, `EcosystemInitiation.cs`, `MigrationHandlerSettings.cs`, `UnitOfWorkFilter.cs` e `frontend/axios/axios.instance.ts`.
- [ ] T153 Cobertura: `dotnet test ../PersonalProspec.slnx --collect:"XPlat Code Coverage"` e `npm run test:coverage`; atingir no mínimo 80% na funcionalidade nova de cada lado.
- [ ] T154 Rodar `npm run format`, `npm run lint`, `npm run ts:check` e `npm run build` em `frontend`, e `dotnet build ../PersonalProspec.slnx` sem warnings novos em `backend/Src`.
- [ ] T155 Varredura de segredo e de log: buscar nos arquivos criados qualquer valor de segredo, qualquer `Console.WriteLine`/`console.log` de payload e qualquer travessão (DOC-STYLE-001); confirmar que `appsettings*.json` só tem estrutura e que nenhum token usa `localStorage` ou `sessionStorage`.
- [ ] T156 Acionar o agente `back-architecture-auditor` e o `front-architecture-auditor` e corrigir toda violação reportada.
- [ ] T157 Executar o roteiro 1 do `specs/000-plano-geral/quickstart.md` de ponta a ponta (entrar, sair, errar a senha 5 vezes) e registrar o resultado.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependência. T002 e T003 só rodam após a aprovação de T001.
- **Foundational (Phase 2)**: depende do Setup e BLOQUEIA todas as histórias.
- **User Stories (Phase 3 a 5)**: dependem da Fundação. Só a US1 resta; US2 e US3 foram removidas.
- **Polish (Phase 6)**: depende das histórias desejadas.

### Dentro da Fundação

- Domain (T005 a T023) antes de Infra (T024 a T039).
- T025 (conversor) e T026 a T030 (mappings) antes de T037 (migration); T037 antes de T038 e T039.
- T034 a T036 antes de T038 (seed) e de T045 (Identity).
- T040 a T043 (ApplicationService) antes de qualquer service das histórias.
- T044 a T061 (Api) dependem de Domain e Infra; T058 e T059 por último na Api.
- T062 a T066 (infra de teste) dependem de T037 a T039 e T058 a T061.
- Frontend: T067 a T074 antes de T075; T076 a T080 independentes entre si; T081 a T087 depois do código que testam; T088 fecha a fase.

### Dentro de cada história

- DTO e contratos, depois service, depois controller, depois testes de integração.
- Teste unitário de service pode correr em paralelo ao controller (arquivos diferentes).
- No frontend: DTO, interface, símbolo e container, service, hook de bootstrap, páginas, rotas, testes e e2e.

### Oportunidades de paralelismo

- Setup: T002 e T003.
- Fundação, Domain: T005 a T023 quase todos [P] (arquivos distintos).
- Fundação, Infra: mappings T026 a T030 e repositórios T031 a T033 em paralelo.
- Fundação, Api: T045 a T053 em paralelo.
- Fundação, Frontend: T067 a T073 e T076 a T079 em paralelo.
- Cada história: DTOs e Builders [P]; arquivos de teste distintos [P].
- Backend e frontend de uma mesma história podem andar em paralelo depois do contrato (`contracts/api.md`) estar fechado.

### Exemplo paralelo: Fundação, Domain

```bash
Task: "Criar Role.cs em Src/PersonalProspec.Domain/Entities/Identity/Role.cs"
Task: "Criar User.cs em Src/PersonalProspec.Domain/Entities/Identity/User.cs"
Task: "Criar RefreshToken.cs em Src/PersonalProspec.Domain/Entities/Identity/RefreshToken.cs"
Task: "Criar Event.cs em Src/PersonalProspec.Domain/Entities/Event.cs"
```

---

## Implementation Strategy

### MVP primeiro (US1)

1. Phase 1: Setup (T001 a T004).
2. Phase 2: Fundação (T005 a T088), sem pular o checkpoint.
3. Phase 3: US1 (T089 a T122).
4. PARAR e VALIDAR: entrar, sair, errar a senha, redirecionar sem sessão. É o menor ponto em que o produto já protege os dados.
5. Fechar a spec 002 e seguir para a spec 001.

### Entrega incremental

1. Setup, Fundação, depois US1: demonstrável (acesso protegido).
2. US2 (recuperação) e US3 (troca de senha) foram removidas do escopo.
4. Cada história acrescenta valor sem quebrar a anterior.

### Riscos para acompanhar

- **Docker** é pré-requisito dos testes de integração (Testcontainers); sem ele T062 e todos os testes de integração ficam bloqueados.
- **Parâmetros do Argon2id** (T015) não têm valor definido neste plano; não inventar.
- **Sigla do schema (D7)**: mantida `APP`; trocar depois da T037 custa nova migration.
- **Decisões aprovadas** em 2026-11-02 estão em Clarifications do `plan.md`; nenhum ponto em aberto de escopo restou.

---

## Notes

- [P] = arquivos diferentes, sem dependência
- [Story] liga a tarefa à história para rastreabilidade
- Cada história deve ser concluível e testável de forma independente
- Fazer commit só quando o Rafael pedir, em Conventional Commits
- Parar em qualquer checkpoint para validar a história isoladamente
- Evitar: tarefa vaga, conflito de arquivo, dependência entre histórias que quebre a independência
