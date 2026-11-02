---
paths:
  - "frontend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de ~/.claude/rules/access-control.md (origem Ponto-Front). Não editar aqui: editar a origem e rodar o script. -->

> Neste monorepo, todo caminho citado (`src/`, `business/`, `axios/`, `tests/`, `vite.config.ts`) é relativo a `frontend/`. Listas específicas do Ponto-Front (slices, componentes, controllers, URLs) valem como exemplo do padrão, não como inventário deste projeto.

# Controle de Acesso (`src/access/`)

## Estrutura real

```
src/access/
├── core/
│   ├── AccessControl.ts        ← createAccessControl(context): IAccessControl
│   └── buildAccessContext.ts   ← monta AccessContext a partir do usuário logado
├── handlers/
│   ├── RouteAccessHandler.ts   ← canAccessRoute(context, path)
│   ├── MenuAccessHandler.ts    ← canShowMenuItem(context, menuKey)
│   └── FeatureAccessHandler.ts ← canUseFeature(context, key)
├── hooks/
│   └── useAccessControl.ts     ← hook: lê useSession(), memoiza IAccessControl
├── policies/
│   ├── accessPolicy.types.ts
│   ├── accessPolicyBuilder.ts  ← AccessPolicyBuilder (fluente): authenticatedOnly/orRole/orProfile/...
│   ├── accessPresets.ts        ← presets reaproveitáveis (AccessPresets.adminOrHr, ...)
│   ├── evaluateAccessPolicy.ts
│   └── permissionMatrix.ts     ← MENU_ACCESS_RULES: Record<PermissionKey, AccessPolicy>
└── types/
    ├── access.types.ts         ← AccessContext
    └── permissionKeys.ts       ← PermissionKeys (chaves de menu/feature)
```

## Uso

```ts
const { canAccessRoute, canShowMenuItem, canUseFeature } = useAccessControl();
```

- Rota: `AuthRequiredRoutes` já chama `canAccessRoute` pra TODA rota privada
  — página não precisa checar de novo (ver `react-router.md`)
- Menu: item do menu lateral só aparece se `canShowMenuItem(PermissionKeys.menu.xxx)`
- Feature pontual dentro de uma tela (ex: botão "Excluir" só pra admin):
  `canUseFeature(PermissionKeys.feature.xxx)`

## Adicionar uma tela/feature nova com restrição de acesso

1. Chave nova em `types/permissionKeys.ts` (`PermissionKeys.menu.xxx` ou
   `.feature.xxx`)
2. Policy em `policies/accessPresets.ts` (reaproveitar preset existente
   sempre que a combinação de roles já existir) ou compor direto com
   `AccessPolicyBuilder` em `permissionMatrix.ts`
3. Entrada em `MENU_ACCESS_RULES`/equivalente de feature em
   `permissionMatrix.ts`
4. Nunca checar `user.role === 'Administrator'` direto num componente —
   sempre através de uma policy nomeada

## Proibido

- Checagem de role/perfil hardcoded num `.controller.tsx` de página
  (`if (user.role === ...)`) — sempre via `canUseFeature`/`canShowMenuItem`
  com uma policy declarada em `permissionMatrix.ts`
- Duplicar a mesma combinação de roles em dois presets diferentes — conferir
  `accessPresets.ts` antes de criar um novo
