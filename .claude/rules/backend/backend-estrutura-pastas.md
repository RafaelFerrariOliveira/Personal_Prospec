---
paths:
  - "backend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/backend-estrutura-pastas.md". Não editar aqui: editar a origem e rodar o script. -->

> Neste projeto: `Projeto` = `PersonalProspec`, `APP` = sigla do schema SQL ([A DEFINIR]). Todo caminho citado é relativo a `backend/`.

Estrutura de pastas do [padrao-projeto-csharp](./padrao-projeto-csharp.md). `Projeto` = nome da solução. **REGRA:** backend novo segue esta árvore, e entidade nova cria os arquivos nos locais do checklist abaixo. Código de cada camada: [backend-codigo-domain](./backend-codigo-domain.md), [backend-codigo-infra](./backend-codigo-infra.md), [backend-codigo-application](./backend-codigo-application.md), [backend-codigo-api](./backend-codigo-api.md), [backend-codigo-testes](./backend-codigo-testes.md). Segredos nunca ficam em nenhuma pasta do repositório: [backend-regra-segredos](./backend-regra-segredos.md).

## Árvore

```text
<Projeto>/
├── Projeto.slnx
├── CLAUDE.md · CLAUDE.local.md (não versionado) · README.md · .gitignore
├── .claude/                          tooling do Claude Code: rules/ · commands/ · skills/ · agents/ · hooks/ · settings.json
├── Src/
│   ├── global.json                   SDK pinado
│   ├── azure-pipelines-backend.yml   pipeline HML
│   ├── azure-pipelines-prd-backend.yml  pipeline PRD
│   ├── build-test-dotnet.yml         template de build/test
│   ├── Projeto.Domain/               não depende de nenhuma camada
│   │   ├── Constants/                ex.: CustomClaim
│   │   ├── Entities/                 entidades anêmicas · Identity/ (User, Role...) · Identity/Base/
│   │   ├── EntitiesValidation/       XxxValidation : Validate<T>
│   │   ├── Enums/                    EXxx
│   │   ├── Extensions/               extensions puras (ex.: DateTimeExtension)
│   │   ├── Handlers/
│   │   │   ├── LoggerSettings/
│   │   │   ├── NotificationSettings/     EMessage, DomainNotification
│   │   │   ├── PaginationSettings/       PageList, PageParams · Filters/XxxPageParams
│   │   │   ├── TenantSettings/
│   │   │   ├── TimeZonesSettings/
│   │   │   └── ValidationSettings/       Validate<T> · DocumentValidation/ (CPF/CNPJ)
│   │   ├── Interfaces/               IValidate, IUnitOfWork, ITenantOwned... · RepositoryContracts/IXxxRepository
│   │   ├── Providers/                XxxOptions (só a forma da configuração, nunca valores)
│   │   ├── UserPolicies/             Policy (roles)
│   │   └── ValueObjects/             records de configuração (ex.: ArgonParameters)
│   ├── Projeto.Infra/                depende de Domain
│   │   ├── Identity/                 UserStore, RoleStore e tipos-modelo do Identity
│   │   ├── Interfaces/               RepositoryContracts/ · ServiceContracts/ (ex.: IPaginationQueryService)
│   │   ├── Migrations/
│   │   ├── ORM/
│   │   │   ├── Contexts/             ApplicationContext
│   │   │   ├── Mappings/             XxxMapping · Base/BaseMapping<T>
│   │   │   ├── Seeds/
│   │   │   └── UoW/                  UnitOfWork
│   │   ├── Repositories/             XxxRepository · Base/RepositoryBase<T>
│   │   └── Services/
│   ├── Projeto.ApplicationService/   depende de Infra
│   │   ├── Dtos/<Entidade>Dtos/      Request/ · Response/
│   │   ├── Extensions/ · Handlers/ · Projections/
│   │   ├── Interfaces/               MapperContracts/IXxxMapper · ServiceContracts/IXxxCommandService, IXxxQueryService
│   │   ├── Mappers/                  XxxMapper
│   │   ├── Services/                 ServiceBase.cs · <Entidade>Services/XxxCommandService, XxxQueryService
│   │   └── Traces/                   XxxTrace
│   └── Projeto.Api/                  depende de ApplicationService
│       ├── Program.cs · appsettings*.json (só estrutura) · AssemblyMarker.cs
│       ├── Controllers/              XxxController
│       ├── Extensions/               ex.: CustomSectionExtension, extensions de ClaimsPrincipal
│       ├── Filters/                  NotificationFilter, UnitOfWorkFilter...
│       ├── IoC/                      InversionOfControlHandler · Containers/ (Service, Mapper, Validation, Repository, Pagination, Authentication)
│       ├── Middlewares/              ex.: CSRF, tenant
│       ├── Routines/                 rotinas da aplicação
│       └── Settings/                 SettingsControl, EcosystemInitiation · Handlers/ (Authentication, Cors, Identity, RateLimiting, AntyCsrf, DatabaseConnection, Filters, MigrationHandler, Provider...)
└── Tests/
    ├── Projeto.UnitTest/
    │   ├── Api/Controllers/<Xxx>ControllerTests/       1 arquivo por endpoint · Base/XxxControllerSetup
    │   ├── ApplicationService/Mappers/                 XxxMapperTests
    │   ├── ApplicationService/Services/<Xxx>Services/  1 arquivo por método · Base/XxxCommandServiceSetup, XxxQueryServiceSetup
    │   ├── Builders/                                   XxxBuilderTest (compartilhados com IntegrationTest)
    │   ├── Domain/                                     EntitiesValidation/ · Extensions/ · Handlers/
    │   └── TestTools/
    ├── Projeto.IntegrationTest/
    │   ├── Executions/<Xxx>ControllerTests/            1 arquivo por endpoint (+ FullCycle opcional)
    │   └── Settings/                                   factory, DatabaseFixture, TestAuthHandler, IntegrationTestBase · Seeds/
    └── Projeto.ArchitectureTest/
        ├── ArchTests/                                  regras de dependência e Main Sequence
        └── Tools/
```

## Checklist: arquivos de uma entidade nova (exemplo `Customer`)

| Camada | Arquivos |
|---|---|
| Domain | `Entities/Xxx.cs` · `EntitiesValidation/XxxValidation.cs` · `Interfaces/RepositoryContracts/IXxxRepository.cs` · `Handlers/PaginationSettings/Filters/XxxPageParams.cs` (se paginar) · enum em `Enums/` (se houver) |
| Infra | `ORM/Mappings/XxxMapping.cs` · `Repositories/XxxRepository.cs` · migration em `Migrations/` |
| ApplicationService | `Dtos/XxxDtos/Request/XxxRegisterRequest.cs`, `XxxUpdateRequest.cs` · `Dtos/XxxDtos/Response/XxxSimpleResponse.cs`, `XxxPaginationResponse.cs`, `XxxListResponse.cs` · `Interfaces/MapperContracts/IXxxMapper.cs` · `Interfaces/ServiceContracts/IXxxCommandService.cs`, `IXxxQueryService.cs` · `Mappers/XxxMapper.cs` · `Services/XxxServices/XxxCommandService.cs`, `XxxQueryService.cs` · `Traces/XxxTrace.cs` |
| Api | `Controllers/XxxController.cs` · registro `AddScoped` em `IoC/Containers/` (ServiceContainer, MapperContainer, ValidationContainer, RepositoryContainer) |
| Tests | `UnitTest/Builders/XxxBuilderTest.cs` (+ builders dos requests) · `UnitTest/Domain/EntitiesValidation/XxxValidationTests.cs` · `UnitTest/ApplicationService/Mappers/XxxMapperTests.cs` · `UnitTest/ApplicationService/Services/XxxServices/` (Base/ + 1 por método) · `UnitTest/Api/Controllers/XxxControllerTests/` (Base/ + 1 por endpoint) · `IntegrationTest/Executions/XxxControllerTests/` |

**Why:** O Rafael definiu (2026-10-19) esta estrutura como padrão de todo projeto C#; localização previsível facilita geração, revisão e testes.
**How to apply:** Ao criar backend ou entidade, seguir árvore e checklist; pastas de teste espelham as de código. `Projeto` vira o nome da solução; a árvore não muda.
