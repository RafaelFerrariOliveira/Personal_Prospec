---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/mvvm-pages-components.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# MVVM — Pages e Components

Padrão obrigatório, com template de referência em
`src/pages/_templates/page-mvvm/`. Aplica-se a toda página nova e a todo
componente reutilizável que tenha lógica própria (chamada de Service, estado,
handler) — componente puramente apresentacional sem lógica (ex: `Button`,
`Container`) pode ser um único arquivo `.tsx` + `.styles.ts` + `.types.ts`.

## Os 4 (ou 5) arquivos

```
NomeFeature.tsx             ← wrapper: injeta dependências, repassa pro controller, renderiza a view
NomeFeature.controller.tsx  ← hook UseNomeFeatureController: toda a lógica
NomeFeature.view.tsx        ← apresentação pura: só recebe props
NomeFeature.types.tsx       ← IXxxControllerDeps, IXxxController, IXxxViewProps
nomeFeature.styles.tsx      ← styled-components (ver styled-components.md)
```

## `NomeFeature.tsx` (wrapper)

```tsx
import { useInjection } from '@hooks/useInjection';
import { useNavigate } from 'react-router-dom';
import UseNomeFeatureController from './NomeFeature.controller';
import NomeFeatureView from './NomeFeature.view';

const NomeFeature = () => {
   const navigate = useNavigate();
   const controller = UseNomeFeatureController({ navigate });
   return <NomeFeatureView {...controller} />;
};

export default NomeFeature;
```

- Única camada que chama `useInjection`/`useNavigate`/`useParams` e repassa
  como `deps` pro controller
- Nunca contém JSX além de `<NomeFeatureView {...controller} />`

## `NomeFeature.controller.tsx` (hook de lógica)

- Nome do hook: `UseNomeFeatureController`
- Recebe `IXxxControllerDeps` (navigate, serviços injetados, params), devolve
  `IXxxController` (dados prontos pra view + handlers)
- Toda chamada a Service, `useState`/`useEffect` de dado de negócio,
  validação de formulário, tratamento de erro — mora aqui
- Nunca retorna JSX

## `NomeFeature.view.tsx` (apresentação pura)

- Recebe só `IXxxViewProps` (= `IXxxController` na maioria dos casos — ver
  `PageName.types.tsx`)
- Nunca importa Service, `useInjection`, Redux, ou qualquer coisa de
  `business/`
- `data-testid` em todo elemento interativo/conteiner de teste (ver
  `tests-pattern.md`)

## `NomeFeature.types.tsx`

```tsx
export interface IXxxControllerDeps {
   navigate: NavigateFunction;
   // outros parâmetros que o wrapper injeta
}

export interface IXxxController {
   // dados prontos + handlers que a view consome
}

export type IXxxViewProps = IXxxController;
```

## Subcomponentes de uma feature

Ficam em `components/` dentro da pasta da própria página
(`src/pages/Holidays/Grid/components/filterForm/`), seguindo o mesmo padrão
de 4-5 arquivos. Só sobem pra `src/components/` (compartilhado) quando
usados por mais de uma feature.

## Proibido

- Lógica de negócio dentro de `.view.tsx`
- `.controller.tsx` retornando JSX
- Pular o `.types.tsx` e inline-tipar props no `.view.tsx`
- Página nova fora desse padrão "porque é simples" — se crescer depois, vira
  retrabalho; o template já existe pronto em `_templates/page-mvvm/`
