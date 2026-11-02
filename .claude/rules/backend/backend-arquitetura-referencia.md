---
paths:
  - "backend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/backend-arquitetura-referencia.md". Não editar aqui: editar a origem e rodar o script. -->

> Neste projeto: `Projeto` = `PersonalProspec`, `APP` = sigla do schema SQL ([A DEFINIR]). Todo caminho citado é relativo a `backend/`.

Arquitetura do [padrao-projeto-csharp](./padrao-projeto-csharp.md), válida para qualquer backend C# do Rafael (`Projeto` = nome da solução). Ferramentas: [backend-stack-ferramentas](./backend-stack-ferramentas.md). Pastas: [backend-estrutura-pastas](./backend-estrutura-pastas.md). Código obrigatório por camada: [backend-codigo-domain](./backend-codigo-domain.md), [backend-codigo-infra](./backend-codigo-infra.md), [backend-codigo-application](./backend-codigo-application.md), [backend-codigo-api](./backend-codigo-api.md), [backend-codigo-testes](./backend-codigo-testes.md). Segredos: [backend-regra-segredos](./backend-regra-segredos.md).

**Camadas: dependência em cadeia (validada por ArchUnitNET em CI):**
`Domain ← Infra ← ApplicationService ← Api` + `Tests/` (UnitTest, IntegrationTest, ArchitectureTest)

- **Domain**: entidades anêmicas (`sealed`, `init` em Id, data de criação e `BusinessUnitId`; `set` no resto; navegação única com `?`, coleção inicializada com `[]`; `ITenantOwned` quando tem tenant), enums `EXxx`, interfaces de repositório (`Domain.Interfaces.RepositoryContracts`), validações FluentValidation (`Validate<T>` + `SetRules()`, mensagens via `EMessage`), Options em `Providers/`, extensions. Não depende de nenhuma camada. Única exceção formal: `Microsoft.EntityFrameworkCore` nas interfaces de repositório (por causa de `IIncludableQueryable`).
- **Infra**: `ApplicationContext : DbContext` (nunca `IdentityDbContext`) com filtro de tenant automático, `ApplyConfigurationsFromAssembly`, mappings Fluent API (`sealed`, herdando `BaseMapping<T>`, schema `OP`; toda prop com `HasColumnType`/`HasColumnName`/`HasColumnOrder`/`IsRequired`), `RepositoryBase<T>` + repositórios concretos (`FindByPredicateAsync` com `include?`/`toQuery`, `ExecuteUpdateAsync`/`ExecuteDeleteAsync` p/ operações atômicas), `UnitOfWork`, migrations code-first, stores de Identity.
- **ApplicationService**: `ServiceBase` (não genérica: `EntityValidationAsync<T>(IValidate<T>, T)` + `GenerateLogger`), `XxxCommandService` (escrita, herda `ServiceBase`, devolve `bool`), `XxxQueryService` (leitura, não herda `ServiceBase`), Facades separadas (ex.: `UserFacadeQueryService`) quando um service consome outro, mappers manuais com sub-mappers, DTOs, Traces.
- **Api**: controllers finos (`sealed`, `[ApiController]`, `[Authorize(Roles)]` e `[EnableRateLimiting]` em cada action, rotas `snake_case`, expression body, `[ProducesResponseType]` completo, zero lógica, tenant via `User.GetBusinessUnitId()`), action filters (`NotificationFilter`, `UnitOfWorkFilter`...), middlewares (CSRF, tenant), IoC em `Api/IoC/Containers/` (Service, Mapper, Validation, Repository, Pagination, Authentication), Options em `Settings/Handlers/`.
- **ApplicationService → Infra é permitido de propósito**: diverge do Clean Architecture "de livro", mas é intencional e testado. Não tratar como violação.

**Padrões transversais:**
- CQRS leve: Command/Query separados em services, **sem MediatR** na referência.
- Notification pattern (`INotificationHandler`) em vez de exceção p/ erro de negócio; `NotificationFilter` converte em 400 (ou 403 quando a chave é `CustomClaim.BusinessUnit`).
- Unit of Work via action filter (commit/rollback sempre com `await`).
- Mapeamento manual (`XxxMapper`), **sem AutoMapper** na referência.
- `XxxTrace` (static class com `const string`) = chave de notificação e de log.
- Datas: nunca `DateTime.Now`/`UtcNow` espalhado no código de negócio; usar o helper central `DateTimeExtension.GetDateAndTimeInBrasilia()` ou `IClock` (NodaTime `SystemClock`, registrado no IoC). Recomendação: `IClock` em código novo, por ser injetável e testável.
- Multi-tenant por `BusinessUnitId`: ver [backend-seguranca-identity](./backend-seguranca-identity.md).
- Fitness functions (Main Sequence Distance máx.): Domain 0.6 · ApplicationService 0.25 · Infra 0.25 · Api 0.1: ver [backend-testes-padrao](./backend-testes-padrao.md).
- Convenções: `sealed` por padrão, primary constructors, file-scoped namespaces, DTOs `sealed record` (Request com `set`, Response com `init`), extension members do C# 14 (`extension(T x) { }`) em extensions novas.

**Why:** Padrão de projeto C# que o Rafael definiu como base de todos os backends dele (2026-10-19), desvinculado de projeto específico.
**How to apply:** Ao criar/revisar backend, aplicar esta estrutura e o código-modelo das notas `backend-codigo-*` como REGRA. Se o pedido romper regra de dependência (ex.: EF Core direto no controller), avisar antes de gerar. Em projeto existente que divirja do padrão, apontar a divergência e perguntar antes de alinhar.
