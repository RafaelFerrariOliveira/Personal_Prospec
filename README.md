# PersonalProspec

Monorepo com backend .NET 10 e frontend React 19, criado em 2026-10-20 seguindo o Padrão de Projeto C# e o Padrão React Front (MVVM) do Rafael.

Objetivo do produto: [A DEFINIR].

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `backend/` | Solução `PersonalProspec.slnx`: `Src/` (Domain, Infra, ApplicationService, Api) e `Tests/` (UnitTest, IntegrationTest, ArchitectureTest). Detalhes em `backend/README.md` |
| `frontend/` | SPA React + Vite: `business/`, `src/`, `axios/`, `tests/`. Detalhes em `frontend/README.md` |
| `.claude/` | Configuração do Claude Code: rules geradas do Obsidian, skills (incluindo `speckit-*`), agents, commands, hooks e permissões. Ver `CLAUDE.md` |
| `.specify/` | GitHub Spec Kit 1.2.2: constituição, templates e scripts PowerShell do fluxo de Spec-Driven Development |
| `specs/` | Specs por feature (`NNN-nome/spec.md`, `plan.md`, `tasks.md`), criadas pelo `/speckit-specify` |

## Pré-requisitos

- .NET SDK 10.0.302 (pinado em `backend/Src/global.json`)
- Node 22 (`frontend/.nvmrc`) e npm
- SQL Server local (ou Docker) para o backend
- Para o Spec Kit: `uv` + Python 3.11+ e o CLI `specify-cli` (`uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v1.2.2`)

## Fluxo de features (Spec Kit)

`/speckit-constitution` (uma vez) → `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement`. Detalhes e regras de integração com os padrões do projeto em `CLAUDE.md`.

## Primeiros passos

As dependências ainda não foram instaladas.

```bash
# Backend (a partir de backend/Src, para o global.json valer)
cd backend/Src
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<sua connection string>" --project PersonalProspec.Api
dotnet build ../PersonalProspec.slnx
dotnet run --project PersonalProspec.Api

# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

Segredos nunca entram no repositório: backend usa `dotnet user-secrets` em dev; frontend usa `.env` (ignorado pelo git).

## Atualizar as rules a partir do Obsidian

```bash
node .claude/scripts/sync-obsidian-rules.mjs
```
