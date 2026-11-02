---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/styled-components.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# styled-components

## Padrão de arquivo

- `nome.styles.ts` (ou `.tsx` se precisar de JSX, ex: ícone inline) na mesma
  pasta do componente/página
- `PascalCase` pro export (`export const Primary = styled.button...`), nunca
  `default export` de styled-component solto

## Tema e design system (`src/extensions/designSystem/`)

- Cores: `colors` (`@extensions/designSystem/colors`) — nunca hex direto
  inline num `styled.xxx` novo, sempre via `colors.categoria.tom`
- Tamanhos/espaçamento/radius/fontSize: `theme`
  (`@extensions/designSystem/themes`) — mesma regra, nunca número mágico
- Acessibilidade de foco: `focusRing` (`@extensions/designSystem/focusRing`)
  — todo elemento interativo novo (botão, input, link) inclui `${focusRing}`

## Props transitórias

Prop que controla estilo mas não deve ir pro DOM usa prefixo `$`
(`$maxWidth`, `$style`, `$isSidebarExpanded`) — convenção nativa do
styled-components v6, evita warning de atributo HTML inválido.

```ts
export const Primary = styled.button<{ $maxWidth: string; $style?: number }>`
   width: ${(props) => props.$maxWidth};
   background-color: ${(props) => (props.$style === 1 ? colors.primary.green[500] : colors.neutro.white)};
`;
```

## Estados obrigatórios em elemento interativo

`:hover`, `:active`, `:disabled` sempre definidos explicitamente (ver
exemplo de `Button` real) — nunca deixar o navegador aplicar estilo default
só no `:disabled`.

## Proibido

- CSS inline (`style={{ ... }}`) ou classe CSS solta fora de
  `styled-components` em componente novo
- Hex de cor ou `px` de espaçamento direto no template string — sempre via
  `colors`/`theme`
- `styled-components` sem tipar as props transitórias (`$xxx`) — sempre com
  generic `styled.tag<{ $prop: tipo }>`
