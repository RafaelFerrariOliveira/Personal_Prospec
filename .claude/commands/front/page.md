# /front:page

Ao receber este comando, gerar TODOS os artefatos listados sem pedir confirmação. Caminhos relativos a `frontend/`. Aplicar `.claude/rules/frontend/mvvm-pages-components.md`, `estrutura-pastas.md`, `nomenclatura.md`, `styled-components.md`, `access-control.md` e `react-router.md`. Ao terminar, listar os arquivos criados e sugerir o próximo passo (`/front:service` se a página ainda não tem Service, ou registrar a rota se faltar).

```
front:page [NomeFeature]
rota:    [path] [publica|privada]
menu:    [chave de permissionKeys, se tiver item de menu]
usa:     [IXxxService já existente, ou "nenhum" se a página só navega]
```

Artefatos (partir de `src/pages/_templates/page-mvvm/`):
`NomeFeature.tsx` (único que chama `useInjection`/`useNavigate`), `NomeFeature.controller.tsx`, `NomeFeature.view.tsx`, `NomeFeature.types.tsx`, `nomeFeature.styles.tsx`.

Se `rota` for informado: adicionar em `src/routes/routePaths.ts`, `LazyImports/{public,private}.tsx` e `DataPaths/{public,private}`. Se `menu` for informado: adicionar em `src/access/policies/permissionMatrix.ts` (se o módulo access ainda estiver pendente, avisar).
