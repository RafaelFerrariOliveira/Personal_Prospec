# PersonalProspec: instruções do projeto

## Instruções de execução

- Nunca explorar a codebase inteira antes de agir: usar este arquivo, `backend/CLAUDE.md`, `frontend/CLAUDE.md` e as rules de `.claude/rules/` como mapa.
- Ler arquivo existente só para conferir interface, tipo ou padrão já implementado, e só o arquivo específico.
- Ao terminar cada tarefa, listar os arquivos criados ou alterados e orientar o próximo passo.
- Não inventar requisito, regra de negócio, API, versão, comando ou resultado de execução: na dúvida, perguntar.
- Commit, push e instalação de dependência só quando o Rafael pedir.

## Projeto

| Item | Situação |
|---|---|
| Objetivo do produto | Sistema local de prospecção B2B com IA: campanha, pesquisa de empresas (Agente Coulson), aprovação de leads, mensagens de WhatsApp (Agente Natasha), envio manual via HERMES, banco central de empresas, tarefas e indicadores. Uso individual. Specs em `specs/001` a `010`; decisões e bloqueios em `docs/discovery/validacao-bloqueios.md` |
| IA | `claude -p` oficial, local, logado pelo Rafael, na assinatura existente. Proibido chave de API, serviço pago e uso do token da assinatura fora do binário oficial sem autorização explícita |
| Arquitetura | Decidida em 2026-10-20: Padrão C# (backend) + Padrão React Front com MVVM (frontend), em monorepo |
| Identidade visual | Decidida em 2026-11-02: o protótipo em `Prototipo/Prototipo/Prototipo/` (ignorado pelo git) é a referência. Nome Personal Prospec; fonte Inter; cor primária índigo `#4338CA`; estados em verde, âmbar e rosa. Tokens em `frontend/src/extensions/designSystem/`. Nunca reaproveitar Style Guide de cliente |
| Sigla do schema SQL | [A DEFINIR]: hoje `APP` no `BaseMapping` |
| Dependências | Não instaladas (esqueleto). `npm install` e `dotnet restore` só com pedido |

## Estrutura

```text
personalprospec/
├── CLAUDE.md · README.md · .gitignore · .mcp.json (Figma, leitura · Playwright 0.0.83)
├── .claude/
│   ├── rules/{geral,backend,frontend}/   GERADAS a partir do Obsidian e das rules globais (não editar à mão)
│   ├── scripts/sync-obsidian-rules.mjs   regenera as rules
│   ├── skills/                           back-gen-entity · front-gen-feature · storybook-source-of-truth · speckit-* (Spec Kit)
│   ├── agents/                           back-architecture-auditor · front-architecture-auditor
│   ├── commands/front/                   /front:* (geração e manutenção do front)
│   ├── hooks/                            block-secrets-commit · block-remote-database
│   └── settings.json                     permissões + hooks
├── .specify/   Spec Kit 1.2.2: memory/constitution.md · templates/ · scripts/powershell/ · workflows/
├── specs/      criada pelo /speckit-specify: uma pasta NNN-nome por feature (spec, plan, tasks)
├── backend/    solução .NET 10 PersonalProspec (Src/ + Tests/), ver backend/CLAUDE.md
└── frontend/   React 19 + Vite (business/ + src/ + axios/ + tests/), ver frontend/CLAUDE.md
```

## Memória (Obsidian)

- A pasta de memória deste projeto (`~/.claude/projects/C--Users-Rafael-Ferrari--claude-project-personalprospec/memory`) é uma junction para `OneDrive/Documentos/Obsidian Vault/Claude Memory`. O índice `MEMORY.md` entra em toda sessão e as notas são as mesmas dos demais projetos.
- Nunca apagar nem recriar a pasta `memory` (quebra a junction). Memória nova: arquivo com nome igual ao `name:` do frontmatter, para os links `[[slug]]` funcionarem no Obsidian.
- Fonte de verdade dos padrões: notas `padrao-projeto-csharp` e `backend-*` (Obsidian) para o backend; `~/.claude/rules/*.md` (origem Ponto-Front) e `padrao-projeto-react-front` para o frontend.
- As rules de `.claude/rules/` são cópias geradas. Mudou o padrão: editar a origem (nota no Obsidian ou rule global) e rodar `node .claude/scripts/sync-obsidian-rules.mjs`.

## Rules

| Pasta | Carrega | Conteúdo |
|---|---|---|
| `.claude/rules/geral/` | Sempre | DOC-STYLE-001 (sem travessão), sigilo e somente leitura, Conventional Commits |
| `.claude/rules/backend/` | Ao tocar `backend/**` | Padrão de Projeto C#: arquitetura, stack, pastas, código-modelo por camada, testes, segurança, segredos, CI/CD |
| `.claude/rules/frontend/` | Ao tocar `frontend/**` | Padrão React Front: MVVM, Service + DI + Zod, rotas, acesso, Redux só global, estilo, forms, testes, segurança |

Caminhos citados nas rules de backend são relativos a `backend/`; nas de frontend, relativos a `frontend/`.

## Ferramentas do projeto

- **Skills**: `back-gen-entity` (entidade completa no backend, checklist por camada), `front-gen-feature` (feature completa no front), `storybook-source-of-truth` (reuso e stories de UI).
- **Agents**: `back-architecture-auditor` e `front-architecture-auditor`. Só auditam e reportam; acionar antes de considerar uma entidade ou feature concluída.
- **Commands**: `/front:page`, `/front:component`, `/front:service`, `/front:feature`, `/front:dto`, `/front:addMethod`, `/front:fix`, `/front:refactorFormat`, `/front:refactorSolid`, `/front:review`, `/front:slice`, `/front:test`. Os `/gen:*` globais são do Ponto-Front e geram caminhos sem `frontend/`: neste projeto, usar `/front:*`.
- **MCP** (`.mcp.json`, escopo de projeto): `figma` (só leitura, ver `figma-integration.md`) e `playwright` (`@playwright/mcp` 0.0.83 da Microsoft, versão fixada; navegar e inspecionar o app rodando, ex. `http://localhost:5173`). Playwright MCP não substitui os testes E2E versionados em `frontend/tests/e2e`. Nunca usá-lo para digitar senha ou segredo real.
- **Plugins**: `ponytail@ponytail` (nível `lite`, padrão do projeto tem precedência; ver seção própria abaixo).
- **Hooks** (`PreToolUse` em Bash e PowerShell): `block-secrets-commit` bloqueia `git add`/`git commit` citando `.env*` (exceto `.env.example`), `.pfx`, `.pem`, `secrets.json`, `appsettings.*.local.json`; `block-remote-database` bloqueia `dotnet ef database update/drop` contra HML/PRD ou com `--connection`.
- **Permissões**: build, lint, testes e migrations locais liberados; `npm install`, `dotnet add package`, `dotnet ef database`, `user-secrets set` e `git push` pedem confirmação; `rm -rf`, `push --force`, `user-secrets list` e leitura de `.env*`, `secrets.json`, `*.pfx`, `*.pem` negados.

## Spec Kit (Spec-Driven Development)

GitHub Spec Kit 1.2.2 (`specify init --here --integration claude --script ps`). Toda feature nova passa pelo fluxo antes do código:

| Ordem | Skill | Saída |
|---|---|---|
| 0 | `/speckit-constitution` | `.specify/memory/constitution.md` (princípios do projeto, v1.0.0) |
| 1 | `/speckit-specify <descrição>` | `specs/NNN-nome/spec.md` (o quê e por quê, sem tecnologia) |
| 2 | `/speckit-clarify` (opcional) | perguntas para tirar ambiguidade, antes do plano |
| 3 | `/speckit-plan` | `plan.md` + artefatos de design (como, com a stack do projeto) |
| 4 | `/speckit-checklist` (opcional) | checklist de qualidade dos requisitos |
| 5 | `/speckit-tasks` | `tasks.md` (tarefas ordenadas e rastreáveis) |
| 6 | `/speckit-analyze` (opcional) | consistência entre spec, plan e tasks |
| 7 | `/speckit-implement` | execução das tarefas |

- **Plano**: o `/speckit-plan` usa a arquitetura já decidida (rules de `.claude/rules/backend/` e `frontend/`); não propor stack, camada ou biblioteca fora do padrão sem perguntar. Contrato entre as pontas conforme a seção abaixo.
- **Implementação**: tarefa de backend segue o checklist da skill `back-gen-entity`; de frontend, a skill `front-gen-feature` e os `/front:*`. Ao final, acionar `back-architecture-auditor` e `front-architecture-auditor`.
- **Requisito sem dono**: regra de negócio ou requisito não informado vira `[NEEDS CLARIFICATION]` na spec, nunca suposição.
- **Escrita**: specs, planos e tarefas em pt-BR, sem travessão (DOC-STYLE-001). Manter títulos, IDs e marcadores dos templates (`FR-001`, `- [ ] T001`), porque as skills dependem deles.
- **Scripts**: `.specify/scripts/powershell/*.ps1` rodam no Windows PowerShell 5.1 (testado); não precisa de `pwsh`. `.specify/feature.json` é estado local e não é versionado.
- **Branch**: a extensão git do Spec Kit não está instalada; branch por feature é decisão manual.
- **Atualizar o Spec Kit**: conferir `specify version` e a release no GitHub; reinstalar fixando a tag (`uv tool install --force specify-cli --from git+https://github.com/github/spec-kit.git@vX.Y.Z`) e rodar de novo `specify init --here --force --integration claude --script ps --non-interactive --ignore-agent-tools`, revisando o diff antes de commitar.

## Plugin Ponytail (escopo de projeto)

`ponytail@ponytail` 5.3.2 (github.com/DietrichGebert/ponytail), instalado em 2026-10-22 com `--scope project` (`extraKnownMarketplaces` + `enabledPlugins` no `.claude/settings.json`). Código revisado antes da instalação: sem chamada de rede com o webhook vazio, não altera arquivos do projeto.

- **Nível padrão neste projeto: `lite`** (`env.PONYTAIL_DEFAULT_MODE`): constrói o que foi pedido e só sugere a opção menor. `/ponytail full|ultra|off` muda apenas a sessão atual. Não usar `/ponytail default ...`: grava em `%APPDATA%\ponytail\config.json` e afeta todos os projetos.
- **Subagentes**: `back-architecture-auditor` e `front-architecture-auditor` não recebem as regras do Ponytail (`env.PONYTAIL_SUBAGENT_MATCHER`); os demais recebem o nível `lite`.
- **Ledger desligado** (`ledger=false`, em `pluginConfigs` do settings de usuário). Não configurar webhook.
- **Statusline**: na primeira sessão o plugin sugere editar `~/.claude/settings.json` com um statusline PowerShell. Não configurar sem pedido do Rafael.
- **Atualização**: `claude plugin update ponytail@ponytail`, revisando antes o que mudou (é código de terceiro com hooks).

**Precedência: o padrão do projeto vence o Ponytail.** Contam como "pedido" e nunca são cortados: MVVM em 5 arquivos, Service + Interface + DI + Zod, Command/Query + Mapper + Notification + Unit of Work, testes na granularidade e cobertura das rules (80%, 1 arquivo por método de service e por endpoint), segurança, segredos e multi-tenant. O Ponytail vale no que as rules não definem: nenhuma abstração, opção, dependência ou código "para depois" além do padrão; reaproveitar o que já existe. Achado de `/ponytail-audit` ou `/ponytail-review` que contradiga o padrão (interface com uma implementação, wrapper do MVVM, testes além de "um teste bom") não é aplicado: citar como "mantido pelo padrão do projeto".

## Regras que valem em todo o projeto

- Responder e documentar em pt-BR; DOC-STYLE-001: nunca usar travessão (U+2014) como separador.
- Sigilo: nunca ler nem exibir valor de segredo; citar só o nome da chave (`Pepper:Secret`, `VITE_API_URL`). Backend: user-secrets em dev e variable group secreto em HML/PRD. Frontend: `.env` fora do git e nada secreto com prefixo `VITE_`.
- Contrato entre as pontas: rotas `api/<Controller>/<acao_snake_case>`, ids Guid (`ZGuid`, baseado em `z.guid()`, no front), paginação `{ items, totalCount, pageNumber, pageSize, totalPages }`, tokens só em cookie httpOnly, CSRF no header `X-CSRF-TOKEN`.
- Commits em Conventional Commits.

## Pendências gerais

A sigla do schema SQL está [A DEFINIR]. Pendências técnicas (Identity, JWT em cookie, CSRF, tenant, rate limiting, módulo de acesso do front, middlewares axios, infraestrutura de teste de integração, pipelines) estão listadas em `backend/README.md` e `frontend/README.md`.
