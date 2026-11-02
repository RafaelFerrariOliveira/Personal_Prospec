# Implementation Plan: Acesso e conta do usuário (spec 002)

**Branch**: `002-acesso-conta` (sem branch git; decisão manual) | **Date**: 2026-11-02 | **Spec**: [spec.md](spec.md)

**Input**: `spec.md` desta pasta e o plano geral em `specs/000-plano-geral/`. Este plano NÃO repete o plano geral: ele recorta o que a spec 002 usa e registra as decisões específicas dela. Escopo da Etapa 1 em `specs/000-plano-geral/escopo-etapa-1.md`.

**Escopo desta etapa**: somente plano e tarefas. Nenhum código, nenhuma instalação.

## Summary

Login por e-mail e senha (recuperação e troca de senha foram removidas em 2026-11-02), para uma conta única criada no seed. É a Fundação da Fase 1 do plano geral: Identity customizado, hash Argon2id com pepper, JWT em cookie HttpOnly, CSRF por middleware, tenant por claim, rate limiting, CORS, desvio de login no `UnitOfWorkFilter`, seed e infraestrutura do teste de integração no backend; middlewares do axios, bootstrap de sessão e CSRF, módulo `src/access` e as telas de acesso no frontend.

## Fontes (leia na ordem)

| Assunto | Arquivo |
|---|---|
| Entidades de acesso, `Event`, estados | `specs/000-plano-geral/data-model.md` (seção Acesso e Histórico) |
| Endpoints `Authentication` e `Antiforgery` | `specs/000-plano-geral/contracts/api.md` |
| Redação de dados sensíveis | `specs/000-plano-geral/contracts/integracoes.md` (seção 6) |
| Pendências de backend (1 a 10, 13, 15 e 16) e de front (1 a 3) | `backend/README.md`, `frontend/README.md` |
| Desenho de segurança | `.claude/rules/backend/backend-seguranca-identity.md`, `backend-regra-segredos.md`, `backend-codigo-api.md` |

## Technical Context

Os da constituição e do plano geral: C# 14 / .NET 10 (SDK 10.0.302), EF Core 10 + SQL Server, FluentValidation, NodaTime; React 19, TypeScript strict, Vite 8, Inversify, Zod 4, react-hook-form, styled-components, axios.

**Pacotes novos (todos dependem de aprovação do Rafael)**: `Konscious.Security.Cryptography.Argon2` 1.3.1 e `Microsoft.Extensions.Identity.Core` na Infra; `Microsoft.AspNetCore.Authentication.JwtBearer` 10.0.13 na Api. As três primeiras versões vêm da nota `backend-stack-ferramentas`; a do Identity Core NÃO está nas notas e deve ser conferida no NuGet na hora. Frontend: nenhum pacote novo.

## Decisões desta spec (2026-11-02, Rafael)

| # | Decisão | Efeito |
|---|---|---|
| A1 | A conta única nasce de um seed que lê `Seed:Email` e `Seed:Password` de user-secrets, chamado pelo `MigrateDatabaseAsync` (pendência 15), só se não existir nenhuma conta | Sem tela de primeiro acesso, sem cadastro público, sem prompt. As duas chaves são segredo: validadas na subida e nunca em log |
| A2 | Uma role fixa `Policy.Administrator`, gravada na conta e no JWT | Toda action usa `[Authorize(Roles = Policy.Administrator)]`, como o padrão manda; perfis futuros não exigem mexer nos controllers |

## Premissas deste plano (derivadas dos artefatos gerais, sem decisão nova)

- **Sem tabela de unidade de negócio.** O `data-model.md` não lista `BusinessUnit`. O `BusinessUnitId` é um Guid fixo do seed (`SystemSeedId.BusinessUnitId`), gravado em `User` e no claim `BusinessUnit`.
- **Eventos de autenticação** (FR-012) vão para a tabela `Event` com `category = Auth`. Falha de entrada de e-mail desconhecido grava o `BusinessUnitId` fixo do seed, porque não há usuário para dar o tenant.
- **`Event.companyId` e `Event.campaignId`** nascem como colunas Guid anuláveis, sem chave estrangeira, porque `Company` e `Campaign` só existem nas specs 007 e 001. A FK entra junto com elas.
- **Datas** como `Instant` (NodaTime), conforme o `data-model.md`, com conversor para `datetime2` no `ApplicationContext`; nunca `DateTime.Now`.

## Valores de partida (sem fonte onde indicado; o Rafael ajusta em `appsettings.json`)

| Valor | Partida | Fonte |
|---|---|---|
| Tamanho mínimo da senha | 8, sem regra de composição | Nota `backend-seguranca-identity` |
| Bloqueio por falhas | 5 tentativas, 5 minutos | Nota `backend-seguranca-identity` |
| Inatividade da sessão (vida do refresh token, renovada a cada rotação) | 30 minutos | `research.md` R11, valor meu, sem fonte |
| Vida do access token | 15 minutos | Valor meu, sem fonte |
| Limite de requisições por minuto (`LimitingByUser`, por usuário e, sem login, por IP) | 60 | Valor meu, sem fonte |
| Parâmetros do Argon2id (memória, iterações, paralelismo) | Perfil mínimo da OWASP, definido na tarefa T015 com a fonte citada | Não inventar |

## Clarifications

### Session 2026-11-02 (Rafael aprovou as recomendações)

- Q: A mensagem de bloqueio pode revelar que o e-mail existe? → A: Sim, só quando a conta existe e está bloqueada. Credencial inválida (e-mail inexistente ou senha errada) usa sempre a mesma mensagem genérica. O SC-003 da spec 002 foi emendado. Sem entidade de tentativas por e-mail.
- Q: A recuperação de senha por e-mail continua? → A: Não, removido em 2026-11-02 (recuperação de senha fora do escopo). Sem ela e com a senha esquecida, o caminho é apagar a conta no banco e rodar o seed de novo.
- Q: Parâmetros do Argon2id? → A: Perfil mínimo recomendado pela OWASP, com a fonte citada em comentário na T015. Os números não estão neste plano; se a fonte não for verificável, a T015 para e pergunta ao Rafael.
- Q: Sigla do schema SQL (D7)? → A: Manter `APP`. Trocar depois custa uma migration, não um refactor.
- Q: Provedor de e-mail (D4)? → A: removido em 2026-11-02 (recuperação de senha fora do escopo); sem e-mail no sistema, não há provedor.
- Q: Como invalidar o access token ao trocar a senha (FR-007)? → A: removida em 2026-11-02 (troca de senha fora do escopo); o `SecurityStamp` continua exigido pelo Identity e conferido na validação do token (T046).

### Ajustes de análise (`/speckit-analyze`, 2026-11-02, aprovados)

- Consulta de sessão recebe `businessUnitId` e o confere (constituição III); Logout ganha tenant e 403 nos testes de integração (constituição IV).
- O endpoint anônimo `refresh_token` roda sem contexto de tenant: o repositório de `RefreshToken` busca e atualiza por hash com `IgnoreQueryFilters()`; o token (256 bits, único) é a proteção da busca.
- Handler global de exceção (`GlobalExceptionMiddleware`) e `FallbackPolicy` autenticada, com teste de arquitetura exigindo `[Authorize]` ou `[AllowAnonymous]` em toda action.
- Fora desta rodada, tratados na implementação: limite por usuário que na prática é por IP porque o RateLimiter vem antes da Autenticação (padrão de ordem mantido); cenário e2e de sessão expirada; algoritmo de assinatura do JWT (sugerido HS256, a confirmar); semântica real da janela de inatividade (entre 15 e 30 minutos).

## Constitution Check

| Princípio | Resultado | Como o plano atende |
|---|---|---|
| I. Camadas do backend | Passa | Entidades anêmicas no Domain, `AuthenticationCommandService` e `AuthenticationQueryService`, notifications com `AuthenticationTrace`, desvio de login no `UnitOfWorkFilter` já previsto no padrão. Portas `IAuthCookieHandler` e `IJwtTokenService` declaradas no ApplicationService e implementadas na Api |
| II. MVVM e dados no front | Passa | 5 arquivos por página, `AuthenticationService` com interface, DI e Zod; sessão em Redux por ser estado global |
| III. Segurança e tenant | Passa | Cookie HttpOnly, Secure e SameSite=Strict, CSRF por middleware, segredos em user-secrets com `ValidateOnStart`, lookups de login com `IgnoreQueryFilters()` |
| IV. Testes | Passa | 1 arquivo por método de service e por endpoint, integração com Testcontainers, Respawn e CSRF real |
| V. Simplicidade | Passa | Sem pacote além dos quatro listados; nenhuma entidade fora do `data-model.md` |
| VI. Sem invenção | Passa | Valores sem fonte marcados na tabela de valores de partida; decisões registradas em Clarifications |

## Project Structure

Documentação: `specs/002-acesso-conta/{spec.md, plan.md, tasks.md}`. Código: `backend/Src/{Domain, Infra, ApplicationService, Api}`, `backend/Tests/{UnitTest, IntegrationTest, ArchitectureTest}`, `frontend/{axios, business, src, tests}`, conforme `estrutura-pastas.md` das rules.

**Structure Decision**: aplicação web já materializada no repositório; nenhum projeto novo na solução.

## Complexity Tracking

Sem desvio da constituição. O desvio de login no `UnitOfWorkFilter` já consta do padrão (`backend-seguranca-identity`).
