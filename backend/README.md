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

| Área | Situação |
|---|---|
| Base do padrão | `ITenantOwned`, `Validate<T>`, notifications (`EMessage`), `DomainLogger`, `ICurrentTenantContext`, `PageList<T>` + `PageParams`, `ApplicationContext` com filtro de tenant automático, `BaseMapping<T>`, `RepositoryBase<T>`, `UnitOfWork`, `ServiceBase`, filtros, IoC, OpenAPI + Scalar, health check, `IClock` |
| Acesso (spec 002) | Identity customizado sem `IdentityDbContext`, Argon2id com pepper, JWT e refresh só em cookie HttpOnly, CSRF por middleware, tenant por claim, rate limiting, CORS, desvio de login no `UnitOfWorkFilter`, seed da conta única. Recuperação e troca de senha foram removidas do escopo em 2026-11-02 |
| Campanhas (spec 001) | `Campaign` com localização (UF e municípios) e CNAE, máquina de estados (Rascunho, Em execução, Pausada, Concluída, Cancelada), histórico na tabela `Event`, idempotência do "Salvar" por `requestId`, `CampaignController` (criar, editar, iniciar, pausar, retomar, cancelar, detalhe, lista paginada, histórico) e `ReferenceController` (UF, municípios, CNAE) |
| Dados de referência | `ReferenceSeed` carrega `ORM/Seeds/Data/cnae.tsv` (1.358 CNAE) e `municipios.tsv` (5.571 municípios com UF e código da Receita) na subida, de forma idempotente. Origem e limites em `docs/discovery/spikes-s1-1-e-s1-2-referencias.md` |
| Tests | UnitTest, IntegrationTest (Testcontainers + Respawn, preservando `Role`, `Cnae` e `Municipality`) e ArchitectureTest (regras de dependência entre camadas) |

`PageList<T>` serializa como `{ items, totalCount, pageNumber, pageSize, totalPages }` (contrato com o front). Ids são `Guid`. Datas saem em UTC (ISO 8601) e enums como texto.

### Configuração (somente nomes)

- user-secrets (obrigatórias, validadas na subida): `ConnectionStrings:DefaultConnection`, `Pepper:Secret`, `JwtToken:JwtKey`, `Seed:Email`, `Seed:Password`. Grave `Seed:Email` e `Seed:Password` antes da primeira subida: a conta única nasce do seed.
- `appsettings.json` (não secretas, valores de partida ajustáveis): `JwtToken` (emissor, audiência e expirações), `RateLimiting:PermitLimitPerMinute`, `Cors:AllowedOrigins` e a seção `Campaign` (`MaxTargetLeadCount`, `MaxCnaePerCampaign`, `MaxCitiesPerCampaign`, `NameMaxLength`, `ObjectiveMaxLength`, `SegmentMaxLength`, `LongTextMaxLength`).
- Suba sempre com `--launch-profile https`: o cookie de CSRF é `Secure` e não funciona em HTTP puro.

## Pendências

1. **Main Sequence Distance** no ArchitectureTest (Domain 0.6, ApplicationService 0.25, Infra 0.25, Api 0.1). Origem: `backend-testes-padrao`.
2. **Pipelines Azure**: `Src/azure-pipelines-backend.yml` (HML), `Src/azure-pipelines-prd-backend.yml` (PRD) e o template `Src/build-test-dotnet.yml`; `projectPath` sempre no `*.Api.csproj`. Origem: `backend-cicd-azure-iis`.
3. **Auditoria em banco**: hoje o `LoggerHandler` só grava os `DomainLogger` no log da aplicação; persistir em tabela é decisão a tomar (D8 do plano geral).
4. **Pesquisa de empresas (spec 003)**: "Iniciar" campanha hoje só muda o estado e grava o evento; o enfileiramento da pesquisa entra com a spec 003, na mesma transação (comentário `shortcut:` em `CampaignCommandService`).
5. **Sigla do schema SQL**: mantida `APP` (decisão D7, 2026-11-02); trocar depois custa uma migration.

## Decisões deste esqueleto que não estão nas notas

- Versões de pacotes fora da nota `backend-stack-ferramentas` vieram dos csproj do backend de referência local: `Microsoft.NET.Test.Sdk` 18.8.1 (UnitTest/IntegrationTest) e 18.11.0 (ArchitectureTest), `xunit.runner.visualstudio` 3.1.5 (xUnit v3) e 4.0.1 (ArchitectureTest), `coverlet.collector` 10.0.1 e 10.1.0, `Microsoft.AspNetCore.Mvc.Testing` 10.0.11, `xunit` 2.9.3.
- `System.Security.Cryptography.Pkcs` 10.0.13 (Infra) e `SSH.NET` 2026.0.0 (IntegrationTest) entram como referência direta para corrigir vulnerabilidades transitivas (NU1902/NU1903), igual ao backend de referência.
- `LoggerHandler` fica em `ApplicationService/Handlers` (como no backend de referência) e grava via `ILogger`; `LoggerFilter` descarrega os logs depois de ações que não são GET.
- OpenAPI e Scalar só são mapeados em Development.
- `AssemblyMarker` em todas as camadas, usado pelo ArchitectureTest para carregar os assemblies.
- `ConnectionStringOptions` com `required` e validada com `ValidateOnStart`, seguindo a regra de segredos (todo segredo validado na subida).
- Filtros globais registrados com `Configure<MvcOptions>` (sem `AddMvc`, para não puxar Razor).
