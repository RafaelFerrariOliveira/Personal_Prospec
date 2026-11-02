# PersonalProspec Backend

API .NET 10 do PersonalProspec, no Padrão de Projeto C# (`Domain <- Infra <- ApplicationService <- Api`). Detalhes do padrão em `.claude/rules/backend/` e em `CLAUDE.md` desta pasta.

## Requisitos

- .NET SDK 10.0.302 (pinado em `Src/global.json`, `rollForward: latestFeature`)
- SQL Server acessível pela connection string de dev
- Docker, para os testes de integração (quando a infraestrutura deles existir)

## Como rodar

Todos os comandos a partir de `backend/Src/`, para o `global.json` valer.

1. Connection string de dev em user-secrets (uma vez por máquina):

   ```bash
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<sua connection string>" --project PersonalProspec.Api
   ```

2. Build e testes:

   ```bash
   dotnet build ../PersonalProspec.slnx
   dotnet test ../PersonalProspec.slnx
   ```

3. Subir a Api:

   ```bash
   dotnet run --project PersonalProspec.Api --launch-profile https
   ```

   - URLs: `https://localhost:7180` e `http://localhost:5180` (o front faz proxy para a 7180)
   - Só em Development: OpenAPI em `/openapi/v1.json` e Scalar em `/scalar`
   - Health check: `/health`
   - Sem `ConnectionStrings:DefaultConnection` a Api não sobe (fail-fast por `ValidateOnStart`)
   - Na subida, `MigrateDatabaseAsync` aplica as migrations pendentes (ainda não há nenhuma)

4. Migrations (quando houver entidades):

   ```bash
   dotnet ef migrations add <Nome> --project PersonalProspec.Infra --startup-project PersonalProspec.Api
   ```

## O que já existe

| Camada | Base pronta |
|---|---|
| Domain | `ITenantOwned`, `IValidate<T>` + `Validate<T>` + `ValidationResponse`, `INotificationHandler` + `NotificationHandler` + `DomainNotification` + `EMessage`, `ILoggerHandler` + `DomainLogger`, `ICurrentTenantContext` + `CurrentTenantContext`, `IUnitOfWork`, `PageList<T>` + `PageParams`, extensions `GetDescription()` e `FormatTo()`, `CustomClaim`, `ConnectionStringOptions` |
| Infra | `ApplicationContext` (filtro de tenant automático por reflection), `BaseMapping<T>`, `RepositoryBase<T>`, `UnitOfWork`, `IPaginationQueryService<T>` + `PaginationQueryService<T>` |
| ApplicationService | `ServiceBase`, `LoggerHandler` |
| Api | `Program.cs`, IoC (`InversionOfControlHandler` + containers), filtros (`NotificationFilter`, `UnitOfWorkFilter`, `LoggerFilter`), `CustomSectionExtension`, Settings (Provider, DatabaseConnection, Controllers, Filters, MigrationHandler), OpenAPI + Scalar, health check, NodaTime `IClock` |
| Tests | UnitTest (19 testes da base do Domain), IntegrationTest (vazio), ArchitectureTest (3 regras de dependência entre camadas) |

`PageList<T>` serializa como `{ items, totalCount, pageNumber, pageSize, totalPages }` (contrato com o front). Ids são `Guid`.

## Pendências

Cada item indica a nota do Obsidian (e a rule em `.claude/rules/backend/`) que define o desenho.

1. **Identity customizado**: `User`/`Role` POCO no Domain (`Entities/Identity/`), `UserStore`/`RoleStore` no Infra, `AddIdentityCore<User>()` sem `IdentityDbContext`, lookups com `IgnoreQueryFilters()`, senha mínima 8 + lockout 5 tentativas/5 min. Origem: `backend-seguranca-identity`.
2. **Hash de senha** `ArgonTwoPasswordHasher<T>` (Argon2id + pepper HMAC-SHA256, `Konscious.Security.Cryptography.Argon2` 1.3.1, `PepperOptions` validada na subida). Origem: `backend-seguranca-identity`, `backend-stack-ferramentas`, `backend-regra-segredos`.
3. **JWT em cookie** HttpOnly/Secure/SameSite=Strict + refresh token com hash no banco e rotação (`Microsoft.AspNetCore.Authentication.JwtBearer` 10.0.13, `JwtTokenOptions`). Origem: `backend-seguranca-identity`.
4. **Middleware CSRF** (Synchronizer Token, header `X-CSRF-TOKEN`, ignora métodos seguros e `[AllowAnonymous]`, roda antes de CORS/RateLimiter/Auth). Origem: `backend-seguranca-identity`.
5. **TenantContextMiddleware** (claim `BusinessUnit` para `ICurrentTenantContext`, serviço injetado no `InvokeAsync`) e extension `User.GetBusinessUnitId()`. Origem: `backend-seguranca-identity`, `backend-codigo-api`.
6. **Rate limiting** (`RateLimitingSettings.LimitingByUser`) e **CORS** (`CorsSettings`). Origem: `backend-codigo-api`, `backend-estrutura-pastas`.
7. **Roles** em `Domain/UserPolicies/Policy` (`Policy.*`) e `AuthorizationBuilder`. Origem: `backend-codigo-api`.
8. **AuthenticationContainer** em `Api/IoC/Containers/` (hoje não é chamado). Origem: `backend-codigo-api`.
9. **Desvio de login no `UnitOfWorkFilter`**: o endpoint de login faz commit sem olhar notification, senão o lockout nunca persiste. Origem: `backend-codigo-api`, `backend-seguranca-identity`.
10. **Infraestrutura do IntegrationTest**: `WebApplicationFactory<Program>`, `DatabaseFixture` com Testcontainers (imagem `rapidfort/microsoft-sql-server-2019-ib`), Respawn entre testes, `TestAuthHandler` (claims por headers `X-Test-*`), `IntegrationTestBase` com `CreateAuthenticatedClientWithCsrfAsync`, rate limit neutralizado e e-mail fake. Origem: `backend-testes-padrao`, `backend-codigo-testes`.
11. **Main Sequence Distance** no ArchitectureTest (Domain 0.6, ApplicationService 0.25, Infra 0.25, Api 0.1). Origem: `backend-testes-padrao`.
12. **Pipelines Azure**: `Src/azure-pipelines-backend.yml` (HML), `Src/azure-pipelines-prd-backend.yml` (PRD) e o template `Src/build-test-dotnet.yml`; `projectPath` sempre no `*.Api.csproj`. Origem: `backend-cicd-azure-iis`.
13. (removido em 2026-11-02: e-mail e MailKit saíram junto com a recuperação de senha)
14. **Auditoria em banco**: hoje o `LoggerHandler` só grava os `DomainLogger` no log da aplicação; persistir em tabela é decisão a tomar.
15. **Seed inicial** em `Infra/ORM/Seeds`, chamado pelo `MigrateDatabaseAsync`.
16. **Sigla do schema SQL**: `BaseMapping.Schema` está como `"APP"` ([A DEFINIR]).

## Decisões deste esqueleto que não estão nas notas

- Versões de pacotes fora da nota `backend-stack-ferramentas` vieram dos csproj do backend de referência local: `Microsoft.NET.Test.Sdk` 18.8.1 (UnitTest/IntegrationTest) e 18.11.0 (ArchitectureTest), `xunit.runner.visualstudio` 3.1.5 (xUnit v3) e 4.0.1 (ArchitectureTest), `coverlet.collector` 10.0.1 e 10.1.0, `Microsoft.AspNetCore.Mvc.Testing` 10.0.11, `xunit` 2.9.3.
- `System.Security.Cryptography.Pkcs` 10.0.13 (Infra) e `SSH.NET` 2026.0.0 (IntegrationTest) entram como referência direta para corrigir vulnerabilidades transitivas (NU1902/NU1903), igual ao backend de referência.
- `LoggerHandler` fica em `ApplicationService/Handlers` (como no backend de referência) e grava via `ILogger`; `LoggerFilter` descarrega os logs depois de ações que não são GET.
- OpenAPI e Scalar só são mapeados em Development.
- `AssemblyMarker` em todas as camadas, usado pelo ArchitectureTest para carregar os assemblies.
- `ConnectionStringOptions` com `required` e validada com `ValidateOnStart`, seguindo a regra de segredos (todo segredo validado na subida).
- Filtros globais registrados com `Configure<MvcOptions>` (sem `AddMvc`, para não puxar Razor).
