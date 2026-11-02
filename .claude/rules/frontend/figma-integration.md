---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/figma-integration.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# Integração com Figma

MCP server oficial do Figma configurado em `.mcp.json` (raiz do repo, escopo
de projeto — todo dev que abrir o repositório no Claude Code recebe o mesmo
servidor, com prompt de aprovação no primeiro uso). Autenticação é por
usuário: na primeira vez, o Claude Code pede login OAuth na conta Figma de
quem está com a sessão aberta.

## Fluxo ao criar/alterar uma tela a partir de um protótipo Figma

1. **Nunca começar direto pelo código.** Pedir/colar o link do frame ou pedir
   pra selecionar o node no Figma antes de gerar qualquer componente.
2. **Visualizar o frame**: usar `get_screenshot` na seleção — é o que dá o
   "olhar" real pro protótipo, não descrição em texto.
3. **Extrair os tokens de design**: `get_variable_defs` na seleção — cor,
   espaçamento, tipografia. Comparar contra `styles/theme.ts` (ver
   `styled-components.md`) antes de inventar um valor novo — se o token já
   existe no tema, reusar; se não existe, sinalizar como tema desatualizado
   em vez de hardcodar o valor solto no componente.
4. **Checar estrutura**: `get_design_context`/`get_metadata` pra entender
   hierarquia de layers antes de decidir a árvore de componentes React.
5. **Checar reuso antes de criar componente novo** — nesta ordem:
   - `get_code_connect_map`/`get_code_connect_suggestions` (se Code Connect
     estiver configurado no arquivo Figma, ele já aponta pro componente de
     código correspondente)
   - Skill `storybook-source-of-truth` (MCP do Storybook) — buscar se já
     existe componente equivalente antes de criar um novo
   - Só depois disso, criar componente novo
6. Ao terminar, seguir o padrão de estados obrigatórios de
   `storybook-source-of-truth` (default/loading/empty/error/disabled) — o
   Figma normalmente só mostra o estado "feliz"; os outros estados continuam
   sendo responsabilidade de quem implementa, não vêm do protótipo.

## Proibido

- Gerar componente a partir de descrição verbal do design quando existe um
  link de Figma disponível — sempre inspecionar o frame real primeiro.
- Hardcodar cor/espaçamento lido do Figma direto no componente — extrair via
  `get_variable_defs` e mapear pro token do tema (`theme.ts`), nunca copiar o
  valor bruto (`#3B82F6`, `16px`) direto no styled component.
- Usar ferramentas de escrita do MCP do Figma (`use_figma`,
  `generate_figma_design`, `create_new_file`, etc.) sem pedido explícito —
  o uso padrão aqui é só leitura (protótipo → código), não o inverso.
