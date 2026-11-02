---
name: storybook-source-of-truth
description: >-
   Storybook como fonte de verdade UI: MCP docs, reuso, stories em PRs. Trigger: storybook, component stories, design system UI, criar/alterar componente.
---

# UI / Storybook Rule

Para qualquer tarefa que altere UI, componentes, páginas, estados visuais, acessibilidade ou comportamento interativo:

1. Consultar primeiro o MCP do Storybook.
2. Executar `list-all-documentation` para localizar componentes existentes.
3. Executar `get-documentation` no componente candidato antes de criar código novo.
4. Reutilizar componentes existentes sempre que possível.
5. Se criar ou alterar componente:
   - criar/atualizar arquivo `.stories.tsx`
   - garantir estados principais: default, loading, empty, error, disabled, dark mode se aplicável
   - documentar props e guidelines de uso
6. Rodar testes de story quando disponíveis.
7. Nenhum PR de UI é aceito sem story e documentação atualizada.

Proibido:

- criar componente duplicado sem verificar Storybook
- alterar UI sem story correspondente
- entregar componente sem estados críticos documentados
- divergir de tokens, variantes e padrões definidos no Storybook
