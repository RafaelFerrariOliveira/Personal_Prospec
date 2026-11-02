---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/security-frontend.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# Segurança — Frontend

Consolidado de dois rules genéricos do dump anterior (`security.md` +
`security-devsecops-ssdls-appsec.md`), cortado pro que se aplica a um SPA
React que consome uma API já protegida (ver `api-integration.md` e o
`security-identity.md` do backend). Não é uma lista de OWASP genérica —
é só o que muda o código deste repositório.

## Nunca fazer

- Guardar token de acesso/refresh em `localStorage`, `sessionStorage` ou
  variável em memória de longa duração — o backend já entrega os dois via
  cookie httpOnly; não há token pra "guardar" no cliente (ver
  `api-integration.md`).
- Hardcode de API key, secret ou URL de ambiente de produção no código —
  tudo via variável de ambiente do Vite (`import.meta.env.VITE_*`), nunca
  commitado.
- `dangerouslySetInnerHTML` com conteúdo vindo da API sem sanitizar — abre
  XSS armazenado se o backend algum dia devolver HTML de usuário sem escapar.
- Log de payload de request/response completo no console em produção —
  pode vazar dado de outro tenant/usuário em ambiente compartilhado
  (ex: print de debug esquecido).
- Fazer request pra API sem `withCredentials: true` — não é só um bug
  funcional (cookie não vai), é também abrir a tentação de "resolver"
  guardando o token em outro lugar inseguro pra contornar.

## Sempre fazer

- Validar toda entrada de formulário com `zod` antes de enviar (ver
  `forms-validation.md`) — não confiar só na validação do backend pro UX,
  mas também não pular a validação do backend assumindo que o client já
  validou.
- Tratar 401/403 de forma explícita (ver `api-integration.md`) — nunca
  deixar o app em estado inconsistente (ex: tela carregando infinito) quando
  a sessão expira.
- Dependência nova: só adicionar com aprovação — não é o Claude quem decide
  sozinho instalar um pacote novo no meio de uma tarefa.
