---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/formatacao.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# Formatação

Fonte de verdade: `.prettierrc` + `eslint.config.js` (ESLint 9 flat config)
— rodar `npm run format`/`npm run lint` em vez de formatar "no olho".

## Regras fixas

- Indentação: 3 espaços (confirmar valor exato em `.prettierrc` antes de
  assumir 2/4 — não é o padrão default do Prettier)
- Aspas simples em TS/TSX
- Ponto-e-vírgula sempre
- Import organizado: libs externas primeiro, depois alias de projeto
  (`@components`, `@business`, `@access`, etc.), depois relativo — sem linha
  em branco dupla entre grupos
- `eslint-plugin-react-hooks` ativo — dependência de `useEffect`/
  `useCallback`/`useMemo` nunca omitida manualmente sem comentário
  justificando

## Proibido

- `// eslint-disable` sem comentário explicando por quê, na mesma linha
- Formatar manualmente em vez de rodar `npm run format` antes de considerar
  a tarefa terminada
- Misturar import de alias (`@pages/...`) com import relativo profundo
  (`../../../pages/...`) pro mesmo tipo de arquivo — usar sempre o alias
  configurado em `tsconfig`/`vite.config.ts`
