// Grupos vazios: as specs seguintes acrescentam as chaves de menu e de feature.
export const PermissionKeys = {
   menu: {},
   feature: {},
} as const;

export type TMenuPermissionKey = (typeof PermissionKeys.menu)[keyof typeof PermissionKeys.menu];
export type TFeaturePermissionKey = (typeof PermissionKeys.feature)[keyof typeof PermissionKeys.feature];
