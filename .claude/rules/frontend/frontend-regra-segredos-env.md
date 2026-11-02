---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/frontend-regra-segredos-env.md". Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

**REGRA do [padrao-projeto-react-front](./padrao-projeto-react-front.md) (definida pelo Rafael em 2026-10-19):** não expor nenhum segredo; todo e qualquer segredo fica no `.env`.

- Tokens de acesso/refresh nunca em `localStorage`, `sessionStorage` nem variável longa: só cookie httpOnly entregue pelo backend.
- Variáveis de ambiente via `import.meta.env.VITE_*`. Atenção: tudo com prefixo `VITE_` vai para o bundle e fica público; segredo de verdade (chave de API privada, senha) não pertence ao Front e deve ficar no backend.
- `.env*` com valor real nunca commitado (`.gitignore`); no Ponto-Front o hook `block-env-commit.sh` bloqueia `git add`/`git commit` de `.env.production` e credenciais (`.pfx`, `.pem`).
- Nunca hardcode de API key, secret ou URL de produção; nunca log de payload completo em produção.
- `dangerouslySetInnerHTML` só com conteúdo sanitizado.
- O Claude nunca lê nem exibe valores: em memória, docs e chat, só o nome da variável (ex: `VITE_API_URL`) ([feedback-sigilo-somente-leitura](../geral/feedback-sigilo-somente-leitura.md)). Backend equivalente: [backend-regra-segredos](../backend/backend-regra-segredos.md).

**Why:** pedido explícito do Rafael.
**How to apply:** ao encontrar segredo em arquivo versionado, mover para `.env`, avisar e lembrar que rotacionar o valor é obrigatório se já foi commitado.
