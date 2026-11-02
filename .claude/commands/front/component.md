# /front:component

Ao receber este comando, gerar os artefatos sem pedir confirmação. Caminhos relativos a `frontend/`. Aplicar `.claude/rules/frontend/mvvm-pages-components.md`, `nomenclatura.md` e `styled-components.md`.

```
front:component [NomeComponente]
escopo:  [compartilhado (src/components/) | feature (src/pages/<Feature>/components/)]
logica:  [sim | nao]
```

- `logica: nao` (puramente apresentacional): só `nomeComponente.tsx` + `nomeComponente.styles.ts` (+ `nomeComponente.types.ts` se tiver props não triviais).
- `logica: sim`: os 5 arquivos MVVM (`.tsx`, `.controller.tsx`, `.view.tsx`, `.types.ts`, `.styles.ts`).
- Estilo só com tokens de `src/extensions/designSystem/`; sem Style Guide definido, não inventar cor nem tipografia.

Ao terminar, listar os arquivos criados e lembrar: componente reutilizável e visual passa pela skill `storybook-source-of-truth` (story + estados default, loading, empty, error, disabled).
