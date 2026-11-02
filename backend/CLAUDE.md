# Backend PersonalProspec

Backend .NET 10 / C# 14 do PersonalProspec, no Padrão de Projeto C# do Rafael: camadas em cadeia `Domain <- Infra <- ApplicationService <- Api` (validada pelo `PersonalProspec.ArchitectureTest`), Command/Query services, Notification pattern, Unit of Work por filtro, multi-tenant por `BusinessUnitId`. Sem MediatR, sem AutoMapper, sem Swashbuckle.

Estado atual: só a base do padrão, sem entidade de negócio (objetivo do produto ainda [A DEFINIR]). Pendências em `README.md`.

## Ordem de leitura das rules

Ficam em `.claude/rules/backend/` (geradas a partir das notas `backend-*` do Obsidian, que são a fonte de verdade). `Projeto` = `PersonalProspec`.

1. `padrao-projeto-csharp`: hub e placeholders
2. `backend-arquitetura-referencia`: camadas e padrões transversais
3. `backend-stack-ferramentas`: ferramentas e versões
4. `backend-estrutura-pastas`: árvore e checklist por entidade nova
5. Código-modelo: `backend-codigo-domain`, `backend-codigo-infra`, `backend-codigo-application`, `backend-codigo-api`, `backend-codigo-testes`
6. Segurança: `backend-seguranca-identity`, `backend-regra-segredos`
7. Qualidade e entrega: `backend-testes-padrao`, `backend-cicd-azure-iis`

## Comandos

Rodar `dotnet` a partir de `backend/Src/`: o `global.json` (SDK 10.0.302) fica lá e só vale para comandos executados nessa pasta ou abaixo dela.

```bash
cd backend/Src
dotnet build ../PersonalProspec.slnx
dotnet test ../PersonalProspec.slnx
dotnet run --project PersonalProspec.Api --launch-profile https
dotnet ef migrations add <Nome> --project PersonalProspec.Infra --startup-project PersonalProspec.Api
```

- `dotnet ef database update` contra HML/PRD só com confirmação explícita do Rafael.
- Segredos de dev ficam em user-secrets (`UserSecretsId` já está no csproj da Api). Quem grava o valor é o Rafael: `dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<valor>" --project PersonalProspec.Api`. O Claude nunca lê nem exibe valores (não usar `dotnet user-secrets list`).
- Sem connection string a Api não sobe (fail-fast por `ValidateOnStart`), por design.

## Entidade nova

1. Seguir o checklist de `backend-estrutura-pastas` (Domain, Infra, ApplicationService, Api, Tests) com a skill `back-gen-entity`.
2. Registrar cada classe nova no container certo de `Api/IoC/Containers/` (Service, Mapper, Validation, Repository).
3. Entidade com tenant implementa `ITenantOwned`; entidade sem coluna própria entra em `ApplyIndirectTenantQueryFilters` (nunca nas duas listas, nunca `HasQueryFilter` no Mapping).
4. Ao terminar, acionar o agente `back-architecture-auditor` e rodar `dotnet test ../PersonalProspec.slnx`.
