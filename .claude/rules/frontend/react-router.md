---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/react-router.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# React Router (v7 — modo declarativo clássico)

**Atenção:** apesar da v7 oferecer "framework mode" com loaders/actions,
este projeto usa `<Routes>`/`<Route>` declarativo clássico
(`BrowserRouter`), não framework mode. Não gerar `loader`/`action`/rotas por
arquivo — não é o que o projeto usa.

## Estrutura real

```
src/routes/
├── RoutesApp.tsx           ← <Router><Suspense><Routes>, mapeia DataPaths.publicRoutes/privateRoutes
├── AuthRequiredRoutes.tsx  ← wrapper de rota privada: bootstrap de sessão, useAccessControl, <Outlet/>
├── DataPaths/
│   ├── public.tsx          ← array { path, element } das rotas públicas
│   ├── private.ts          ← array { path, element } das rotas privadas
│   └── import.ts           ← agrega public+private em dataPathsImport
├── LazyImports/
│   ├── public.tsx          ← React.lazy() de cada página pública
│   └── private.tsx         ← React.lazy() de cada página privada
├── routePaths.ts           ← constante única de path por tela (fonte de verdade de URL)
└── defaultContainer.styles.ts
```

## Adicionar uma rota nova

1. Path novo em `routePaths.ts`
2. `React.lazy(() => import('@pages/NomeFeature/NomeFeature'))` em
   `LazyImports/private.tsx` (ou `public.tsx` se não exigir login)
3. Entrada `{ path: RoutePaths.nomeFeature, element: LazyNomeFeature }` em
   `DataPaths/private.ts` (ou `public.tsx`)
4. Se a rota tiver item de menu: registrar em
   `src/access/policies/permissionMatrix.ts` (ver `access-control.md`)

## Proteção de rota privada

`AuthRequiredRoutes` (não cada página individualmente):
1. Bootstrapa sessão (`bootstrapSession`) se ainda não bootstrapada
2. Mostra `Loading` enquanto bootstrapa
3. Redireciona pra `/` se não houver usuário/sessão
4. Chama `canAccessRoute(location.pathname)` (`useAccessControl`) —
   redireciona pra `/home` se a rota não for permitida pro usuário
5. Só então renderiza `<Sidebar/>` + `<Outlet/>`

Página nunca faz sua própria checagem de "usuário logado" — isso é
responsabilidade de `AuthRequiredRoutes`, uma vez só.

## Lazy loading

Toda página (pública ou privada) é importada via `React.lazy()` em
`LazyImports/`, nunca `import` direto em `DataPaths/` — e sempre dentro do
`<Suspense fallback={<Loading isLoading={true} />}>` de `RoutesApp.tsx`.

## Proibido

- `loader`/`action`/rota por arquivo (framework mode) — não é o padrão deste
  projeto
- Checagem de autenticação dentro do `.controller.tsx` de uma página
  individual — isso é `AuthRequiredRoutes`
- Import direto (não-lazy) de página em `DataPaths/`
- Path de rota hardcoded numa página — sempre via `routePaths.ts`
