---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/redux-toolkit.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# Redux Toolkit — Só Estado Global

Hoje existem 6 slices: `session`, `user`, `theme`, `roles`, `businessUnit`,
`ianaTimeZone` — todos estado realmente cross-cutting (sessão, tema, unidade
de negócio ativa), nunca dado de uma feature específica.

## Quando usar Redux (checklist, as 3 precisam ser verdade)

1. O dado precisa ser lido por telas/componentes não relacionados entre si
   (ex: `businessUnitId` ativo, usado em quase toda feature)
2. O dado sobrevive a navegação entre páginas diferentes
3. Não é "dado de servidor" (resultado de listagem, detalhe de registro) —
   isso é responsabilidade do Service (ver `services-di-ioc.md`), nunca do
   Redux

Se qualquer uma for falsa, o estado é local (`useState` no `.controller.tsx`
da feature) ou vem do Service a cada chamada — não cria slice novo.

## Convenções de slice

```
src/stores/reducers/xxx/xxxSlice.ts
```

```ts
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@store/store';

export type XxxState = { /* ... */ };
const initialState: XxxState = { /* ... */ };

const xxxSlice = createSlice({
   name: 'xxx',
   initialState,
   reducers: {
      setAlgumaCoisa(state, { payload }: PayloadAction<string>) {
         state.algumaCoisa = payload;
      },
   },
});

export const selectAlgumaCoisa = (state: RootState): string => state.xxx.algumaCoisa;
export const { setAlgumaCoisa } = xxxSlice.actions;
export default xxxSlice.reducer;
```

- Sempre `createSlice` — nunca reducer/action escritos à mão com `switch`
- Registrar o reducer em `src/stores/combineReducers.ts`
- Seletor dedicado por campo (`selectXxx`) — componente nunca acessa
  `state.xxx.campo` diretamente
- `useAppDispatch`/`useAppSelector` tipados — nunca `useDispatch`/
  `useSelector` crus do `react-redux`
- "Mutação" direta dentro do `createSlice` é segura (Immer) — fora dele,
  nunca

## Proibido

- `createAsyncThunk` chamando Service pra popular slice com dado de listagem/
  detalhe de feature — esse dado fica no `.controller.tsx` da página
  (`useState` + chamada ao Service), não no Redux
- Criar slice novo por feature "pra ter em um lugar só" — ver checklist acima
- Estado de UI efêmero (modal aberto/fechado, aba ativa, valor de input não
  submetido) indo pro Redux — fica em `useState` local
