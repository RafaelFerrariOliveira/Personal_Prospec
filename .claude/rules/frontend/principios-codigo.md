---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/principios-codigo.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# Princípios de Código

- **YAGNI** — não construir abstração/prop/flag de configuração especulando
  uso futuro; resolver o caso pedido
- **DRY com critério** — duas ocorrências parecidas não justificam extrair
  hook/componente genérico ainda; na terceira, considerar
- **KISS** — preferir a solução mais direta que passa nos testes; otimização
  prematura de performance (memoização excessiva, `useMemo` em cálculo
  trivial) é complexidade sem benefício
- **Composição sobre herança** — componente React é composição de
  componentes menores, nunca hierarquia de classes
- **Falha explícita** — Service lança erro, controller decide o que fazer
  com ele (ver `services-di-ioc.md`); nunca engolir erro em `catch` vazio
- **Página/componente burro, lógica no controller** — `.view.tsx` não decide
  nada, só mostra o que o controller mandou (ver `mvvm-pages-components.md`)
