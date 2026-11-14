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

## Publicação (GitHub Codespaces)

Publicação gratuita para demonstração: o Codespace roda o SQL Server em contêiner e o API serve o build do React no mesmo endereço.

1. Ao criar o Codespace na `main`, preencha os segredos `SEED_EMAIL` e `SEED_PASSWORD` (conta única que entra no sistema).
2. No terminal do Codespace: `bash .devcontainer/publicar.sh`. Os demais segredos (SA do banco, pepper, chave JWT) são gerados em `~/.personalprospec`, fora do repositório.
3. Libere a porta: `gh codespace ports visibility 5180:public -c $CODESPACE_NAME` (o script mostra o endereço público).
4. Monitoramento: cadastre a variável de repositório `PUBLIC_URL` com o endereço público; o workflow `Monitoramento` verifica `/health` a cada 30 minutos.

Para derrubar: apague a variável `PUBLIC_URL` e exclua o Codespace.

## Atualizar as rules a partir do Obsidian

```bash
node .claude/scripts/sync-obsidian-rules.mjs
```
