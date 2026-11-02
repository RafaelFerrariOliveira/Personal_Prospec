# /front:slice

**Antes de executar**, confirmar contra o checklist de `.claude/rules/frontend/redux-toolkit.md` (as 3 condições) que o dado é realmente estado global cross-cutting. Se qualquer uma falhar, recusar e sugerir `useState` local no `.controller.tsx` da feature.

```
front:slice [nome]
campos: [campo: tipo, ...]
acoes:  [setAlgumaCoisa, clearAlgumaCoisa, ...]
```

Gerar `frontend/src/stores/reducers/[nome]/[nome]Slice.ts` com `createSlice`, seletores dedicados (`select[Campo]`), e registrar em `frontend/src/stores/combineReducers.ts`.
