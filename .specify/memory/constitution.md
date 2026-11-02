# PersonalProspec Constitution

## Core Principles

### I. Arquitetura em Camadas no Backend

O backend .NET DEVE seguir a cadeia de dependência `Domain ← Infra ← ApplicationService ← Api`,
validada pelo `PersonalProspec.ArchitectureTest`.

- Domain não depende de nenhuma camada; entidades são anêmicas e `sealed`. Única exceção: tipos
  do EF Core nas interfaces de repositório.
- Escrita em `XxxCommandService` (herda `ServiceBase`, devolve `bool`); leitura em `XxxQueryService`.
- Erro de negócio DEVE virar notification (`XxxTrace` + `EMessage`), nunca exceção; o
  `NotificationFilter` converte em 400, ou 403 quando a chave é de tenant.
- Transação DEVE passar pelo `UnitOfWorkFilter`; GET não abre transação.
- Mapeamento manual (`XxxMapper`); controllers finos, sem lógica.
- É PROIBIDO usar MediatR, AutoMapper ou Swashbuckle. ApplicationService referenciar Infra é
  decisão deliberada do padrão, não violação.

Racional: localização previsível e regras verificáveis por teste de arquitetura; padrão já
validado em produção.

### II. MVVM e Camada de Dados no Frontend

- Toda página ou componente com lógica DEVE ter os 5 arquivos MVVM: wrapper `Nome.tsx`,
  `Nome.controller.tsx` (sem JSX), `Nome.view.tsx` (apresentação pura), `Nome.types.tsx` e
  `nome.styles.ts`.
- `useInjection` só no wrapper; o controller recebe as dependências por parâmetro.
- Toda chamada de API DEVE passar por `XxxService` (`extends BaseService`) com `IXxxService`,
  registrado no IoC (Inversify); resposta validada com Zod via `validateResponse`; tipos via `z.infer`.
- Redux só para estado global que passe nas 3 condições de `redux-toolkit.md`; dado de feature
  fica no controller.
- Rotas declarativas e lazy; acesso por policy nomeada, nunca `user.role === ...`.
- Estilo só com tokens do design system: sem hex, px solto ou `style={{}}`.

Racional: um único modelo de componentização em todos os projetos React do Rafael; view burra e
lógica testável no controller.

### III. Segurança, Segredos e Multi-tenant (INEGOCIÁVEL)

- Segredo NUNCA entra no repositório, em log, em resposta HTTP ou em mensagem de exceção.
  Backend: user-secrets em dev, variable group secreto em HML/PRD, `appsettings.json` só com a
  estrutura, toda Options de segredo validada com `ValidateOnStart`. Frontend: `.env` fora do git
  e nada secreto com prefixo `VITE_`.
- Tokens de acesso e refresh só em cookie HttpOnly, Secure e SameSite=Strict; CSRF por middleware
  com header `X-CSRF-TOKEN`; nunca token em `localStorage` ou `sessionStorage`.
- Tenant por `BusinessUnitId`: entidade com coluna própria implementa `ITenantOwned`; entidade
  indireta entra em `ApplyIndirectTenantQueryFilters`; NUNCA `HasQueryFilter` em mapping nem a
  mesma entidade nas duas listas. `businessUnitId` também entra no predicado das consultas.
- GetById DEVE responder igual para "não existe" e "é de outro tenant".
- O agente nunca lê nem exibe valor de segredo; cita só o nome da chave.

Racional: decisões contraintuitivas já testadas em produção; "corrigi-las" abre vulnerabilidade
ou vazamento entre tenants.

### IV. Testes com Granularidade e Cobertura Definidas

- Backend: Builder fluente compartilhado; 1 arquivo por método de service; 1 arquivo por
  endpoint; nome `Metodo_Cenario_ResultadoEsperado` com `[Trait]`. Integração DEVE cobrir caminho
  feliz, isolamento de tenant e 403 por role (Testcontainers, Respawn e CSRF real). ArchitectureTest
  sempre verde.
- Frontend: testes em `tests/` espelhando `src/` e `business/`; Arrange-Act-Assert; mock só na
  fronteira do Service; cobrir acerto, erro, caso adverso e cancelamento por `signal`; cobertura
  mínima de 80% em funcionalidade nova.
- Componente visual reutilizável DEVE ter story com os estados default, loading, empty, error e
  disabled.

Racional: cobertura real de segurança e localização previsível; "um teste bom" não substitui esta
granularidade.

### V. Simplicidade Dentro do Padrão

- Nenhuma abstração, opção, configuração, dependência ou código "para depois" além do que o
  padrão e a spec exigem (YAGNI); extrair reuso só na terceira ocorrência.
- As estruturas exigidas pelos princípios I a IV contam como pedidas e NUNCA são cortadas por
  simplificação, inclusive por sugestão do plugin Ponytail.
- Reaproveitar o que já existe no código antes de criar algo novo.
- Dependência nova só com aprovação do Rafael.
- Falha explícita: erro nunca é engolido em `catch` vazio.

Racional: o menor código que cumpre o padrão; simplicidade não autoriza quebrar a arquitetura.

### VI. Requisitos sem Invenção

- Requisito, regra de negócio, API, versão, comando ou resultado de execução NUNCA é inventado.
- O que não foi informado DEVE aparecer como `[NEEDS CLARIFICATION]` na spec e ser resolvido
  (`/speckit-clarify` ou pergunta direta) antes do plano.
- Toda feature nova passa por spec, plan e tasks antes do código.
- Identidade visual não é assumida: até existir Style Guide, só tokens neutros.

Racional: o Rafael decide requisitos e arquitetura; suposição vira retrabalho.

## Stack e Contrato entre as Pontas

- Backend: .NET 10 / C# 14 (SDK 10.0.302 pinado em `backend/Src/global.json`), ASP.NET Core,
  EF Core 10 + SQL Server (code-first, Fluent API), FluentValidation, NodaTime (`IClock`, nunca
  `DateTime.Now`), OpenAPI + Scalar, xUnit v3 + Moq, Testcontainers, ArchUnitNET.
- Frontend: Node 22, React 19, Vite 8, TypeScript strict, react-router-dom v7 declarativo (sem
  loader/action), Redux Toolkit, Inversify, Zod 4, react-hook-form, styled-components v6, axios,
  Vitest + Testing Library, Storybook 10, Playwright.
- Contrato: rotas `api/<Controller>/<acao_snake_case>`; ids Guid (`ZGuid`, baseado em `z.guid()`,
  no front); paginação `{ items, totalCount, pageNumber, pageSize, totalPages }`.
- Versão de pacote vem de fonte verificável (csproj de referência, NuGet, npm), nunca de suposição.
- Fonte de verdade dos padrões: rules em `.claude/rules/`, geradas a partir das notas do Obsidian
  (`node .claude/scripts/sync-obsidian-rules.mjs`).

## Fluxo de Desenvolvimento e Quality Gates

- Fluxo Spec Kit: `/speckit-specify` → `/speckit-clarify` (quando houver ambiguidade) →
  `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement`.
- Gate do plano: o Constitution Check do `plan.md` DEVE passar; violação só com justificativa em
  Complexity Tracking e aceite do Rafael.
- Implementação: backend pelo checklist da skill `back-gen-entity`; frontend pela skill
  `front-gen-feature` e pelos comandos `/front:*`.
- Antes de concluir: build e testes verdes; `ts:check`, `lint` e `format` no front; agentes
  `back-architecture-auditor` e `front-architecture-auditor` sem violação.
- Commits em Conventional Commits; commit, push e instalação de dependência só com pedido do Rafael.
- Alteração de banco em HML/PRD nunca é feita pelo agente (bloqueada por hook).
- Specs, planos e tarefas em pt-BR e sem travessão (DOC-STYLE-001), mantendo títulos, IDs e
  marcadores dos templates.

## Governance

- Esta constituição prevalece sobre preferências de ferramentas e plugins dentro do projeto. Em
  conflito com uma rule de `.claude/rules/`, vale a rule (fonte de verdade do padrão) e esta
  constituição DEVE ser emendada.
- Emenda: via `/speckit-constitution`, com aprovação do Rafael; o Sync Impact Report é removido
  antes do commit.
- Versionamento semântico: MAJOR para remoção ou redefinição incompatível de princípio; MINOR para
  princípio ou seção nova, ou orientação ampliada; PATCH para esclarecimento e redação.
- Conformidade: todo `plan.md` passa pelo Constitution Check; toda revisão de código verifica os
  princípios; a orientação de execução do dia a dia fica em `CLAUDE.md`.
- Mudança nas notas do padrão no Obsidian exige regenerar as rules e revisar esta constituição.

**Version**: 1.0.0 | **Ratified**: 2026-10-22 | **Last Amended**: 2026-10-22
