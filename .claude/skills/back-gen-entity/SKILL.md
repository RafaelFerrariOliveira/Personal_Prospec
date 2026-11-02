---
name: back-gen-entity
description: Gera uma entidade completa no backend .NET do PersonalProspec (Domain, Infra, ApplicationService, Api, IoC, migration e testes) seguindo o Padrão de Projeto C# do Rafael (notas backend-* do Obsidian, copiadas em .claude/rules/backend/). Usar sempre que pedirem para criar entidade, cadastro, CRUD, endpoint ou tabela nova no backend.
---

# Gerar entidade: backend PersonalProspec

Fonte das regras: `.claude/rules/backend/` (gerado a partir do Obsidian). Placeholder `Projeto` = `PersonalProspec`. Rodar comandos `dotnet` a partir de `backend/Src/` (o `global.json` fica lá).

## Perguntar antes de gerar (não assumir)

1. **Nome da entidade** (PascalCase, singular) e **campos**: nome, tipo, obrigatório ou não, tamanho máximo, unicidade.
2. **Tenant**: tem `BusinessUnitId` próprio (implementa `ITenantOwned`) ou chega ao tenant por navegação (filtro em `ApplyIndirectTenantQueryFilters`)? Nunca os dois.
3. **Relacionamentos** (navegação única, coleção) e **enums** (`EXxx`).
4. **Operações**: `register`, `update_register`, `delete`, `get_by_id`, `get_all_with_pagination` (quais filtros no `XxxPageParams`), `get_all`.
5. **Roles por endpoint** (constantes `Policy.*`). Se autenticação, roles ou rate limiting ainda estiverem na lista de PENDÊNCIAS de `backend/README.md`, avisar e perguntar como proceder antes de gerar os atributos de segurança.

## Convenções fixas (aplicar sempre, não perguntar)

- `sealed` por padrão, primary constructors, file-scoped namespaces, extension members do C# 14 em extensions novas.
- Entidade anêmica: `init` em Id, data de criação e `BusinessUnitId`; `set` no resto; `required` nos obrigatórios; navegação única com `?`; coleção com `[]`.
- Validação herda `Validate<T>`, regras em `SetRules()`, mensagens só via `EMessage...GetDescription().FormatTo(...)`.
- Mapping herda `BaseMapping<T>`, schema do sistema, toda propriedade com `HasColumnType`, `HasColumnName` (snake_case), `HasColumnOrder`, `IsRequired`; FK `DeleteBehavior.NoAction`; nunca `HasQueryFilter` no mapping.
- Command herda `ServiceBase`, devolve `bool`, erro de negócio por notification (`XxxTrace` + `EMessage`), nunca exceção. Query não herda `ServiceBase`, devolve DTO ou `null`.
- `businessUnitId` chega por parâmetro do controller e entra no predicado (defesa em profundidade).
- Mapper manual com sub-mappers injetados; DTO `sealed record` (Request com `set`, Response com `init`).
- Datas por `IClock` injetado, nunca `DateTime.Now`/`UtcNow`. Sem MediatR, sem AutoMapper, sem Swashbuckle.
- Controller fino: expression body, rota `verbo_entidade` em snake_case, `[Authorize(Roles)]`, `[EnableRateLimiting]`, `[ProducesResponseType]` 200/400/401/403/500.

## Passo a passo (checklist de `backend-estrutura-pastas`)

1. **Domain**: `Entities/Xxx.cs`, `EntitiesValidation/XxxValidation.cs`, `Interfaces/RepositoryContracts/IXxxRepository.cs`, `Handlers/PaginationSettings/Filters/XxxPageParams.cs` (se paginar), enum em `Enums/` (se houver).
2. **Infra**: `ORM/Mappings/XxxMapping.cs`, `Repositories/XxxRepository.cs` (`FindByPredicateAsync` com `include`/`toQuery`, `ExecuteDeleteAsync`/`ExecuteUpdateAsync` nas operações atômicas, `PaginationFilter` privado e estático); filtro indireto de tenant em `ApplicationContext` se for o caso.
3. **ApplicationService**: DTOs em `Dtos/XxxDtos/Request` (`XxxRegisterRequest`, `XxxUpdateRequest`) e `Response` (`XxxSimpleResponse`, `XxxPaginationResponse`, `XxxListResponse`); `Interfaces/MapperContracts/IXxxMapper.cs`; `Interfaces/ServiceContracts/IXxxCommandService.cs` e `IXxxQueryService.cs`; `Mappers/XxxMapper.cs`; `Services/XxxServices/XxxCommandService.cs` e `XxxQueryService.cs`; `Traces/XxxTrace.cs`.
4. **Api**: `Controllers/XxxController.cs`; uma linha `AddScoped` em cada container de `IoC/Containers/` (Service, Mapper, Validation, Repository).
5. **Testes**: `UnitTest/Builders/XxxBuilderTest.cs` (+ builders dos requests); `UnitTest/Domain/EntitiesValidation/XxxValidationTests.cs`; `UnitTest/ApplicationService/Mappers/XxxMapperTests.cs`; `UnitTest/ApplicationService/Services/XxxServices/` (Base com Setup + 1 arquivo por método); `UnitTest/Api/Controllers/XxxControllerTests/` (Base + 1 arquivo por endpoint); `IntegrationTest/Executions/XxxControllerTests/` (1 por endpoint, cobrindo caminho feliz, isolamento de tenant e 403 por role). Nome `Metodo_Cenario_ResultadoEsperado` + `[Trait]`. Se a infraestrutura de IntegrationTest ainda estiver pendente, registrar o gap em vez de improvisar.
6. **Migration**: `dotnet ef migrations add Add<Xxx> --project PersonalProspec.Infra --startup-project PersonalProspec.Api` a partir de `backend/Src/`. `dotnet ef database update` só em banco local e com confirmação; HML/PRD é bloqueado pelo hook do projeto.

## Checklist final

- [ ] Dependências respeitam a cadeia Domain, Infra, ApplicationService, Api
- [ ] Entidade com tenant implementa `ITenantOwned` (ou filtro indireto), nunca os dois
- [ ] Nenhum `HasQueryFilter` em mapping, nenhum `throw` para erro de negócio
- [ ] Todos os registros de IoC feitos
- [ ] Testes na granularidade do padrão (1 por método de service, 1 por endpoint)
- [ ] Nenhum segredo em arquivo versionado
- [ ] `dotnet build` e `dotnet test` verdes (se os pacotes já estiverem restaurados)
- [ ] Rodar o agente `back-architecture-auditor` antes de concluir

## Fora do escopo desta skill

- Tela da entidade no front: usar a skill `front-gen-feature` (nome em `ApiControllers` = nome do controller C#; ações iguais às rotas snake_case; ids Guid viram `ZGuid` no Zod).
- Autenticação, Identity, CSRF e middleware de tenant: implementar à parte, com revisão extra (`backend-seguranca-identity`).
