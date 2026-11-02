---
paths:
  - "backend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/backend-stack-ferramentas.md". Não editar aqui: editar a origem e rodar o script. -->

> Neste projeto: `Projeto` = `PersonalProspec`, `APP` = sigla do schema SQL ([A DEFINIR]). Todo caminho citado é relativo a `backend/`.

Ferramentas do [padrao-projeto-csharp](./padrao-projeto-csharp.md). Versões de referência levantadas em 2026-10-19 num backend em produção. Arquitetura: [backend-arquitetura-referencia](./backend-arquitetura-referencia.md).

| Área | Ferramenta (versão de referência) |
|---|---|
| Runtime | .NET 10 / C# 14, SDK `10.0.302` pinado em `global.json` (`rollForward: latestFeature`) |
| IDE | JetBrains Rider |
| API | ASP.NET Core 10 · `Microsoft.AspNetCore.OpenApi` 10.0.13 |
| Doc de API | **Scalar** (`Scalar.AspNetCore.Microsoft` 2.18.0), **não** Swashbuckle/Swagger |
| Auth | `Microsoft.AspNetCore.Authentication.JwtBearer` 10.0.13 (JWT lido de cookie) · Identity Core customizado · Antiforgery nativo |
| Hash de senha | `Konscious.Security.Cryptography.Argon2` 1.3.1 (Argon2id + pepper) |
| Banco/ORM | SQL Server · EF Core 10.0.13 (`SqlServer`, `Design`, `Tools`), code-first, Fluent API |
| Validação | FluentValidation 12.2.0 |
| Datas | NodaTime 3.3.5 (via `IClock`) |
| E-mail | MailKit 4.18.1 |
| Testes | xunit.v3 3.2.2 · Moq 4.18.4 · `Microsoft.AspNetCore.Mvc.Testing` (WebApplicationFactory) · Testcontainers.MsSql 4.13.0 · Respawn 7.0.0 · coverlet |
| Arquitetura | `TngTech.ArchUnitNET.xUnit` 0.13.4 (preso em xunit 2.9.3, sem build p/ xUnit v3) |
| CI/CD | Azure Pipelines (YAML + template reutilizável) → deploy IIS em self-hosted agent |
| Containers | Docker (usado pelo Testcontainers nos testes de integração) |

**Fora do padrão de referência:** MediatR, AutoMapper, Swashbuckle (aparecem só nos projetos de estudo: `projetos-estudo-backend` (nota Obsidian)).

**Why:** É o que está efetivamente em uso no backend de produção do Rafael; serve de baseline p/ projetos novos.
**How to apply:** Usar esta stack por padrão. Versões envelhecem: antes de recomendar versão específica, conferir no csproj atual/NuGet; nunca inventar versão.
