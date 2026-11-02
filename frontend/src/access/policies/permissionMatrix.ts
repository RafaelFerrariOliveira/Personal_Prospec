import { PermissionKeys, type TFeaturePermissionKey, type TMenuPermissionKey } from '@access/types/permissionKeys';
import type { TAccessPolicy } from './accessPolicy.types';
import { AccessPresets } from './accessPresets';

export const MENU_ACCESS_RULES: Record<TMenuPermissionKey, TAccessPolicy> = {
   [PermissionKeys.menu.campaigns]: AccessPresets.authenticated,
};

export const FEATURE_ACCESS_RULES: Record<TFeaturePermissionKey, TAccessPolicy> = {};

// Exceções por path, quando a rota exigir mais que o padrão.
export const ROUTE_ACCESS_RULES: Record<string, TAccessPolicy> = {};

// Toda rota privada sem regra própria exige usuário autenticado.
export const DEFAULT_ROUTE_ACCESS_POLICY: TAccessPolicy = AccessPresets.authenticated;
