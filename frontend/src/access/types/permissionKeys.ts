// Chaves de menu e de feature; cada spec acrescenta as suas.
export const PermissionKeys = {
   menu: {
      campaigns: 'menu.campaigns',
   },
   feature: {},
} as const;

export type TMenuPermissionKey = (typeof PermissionKeys.menu)[keyof typeof PermissionKeys.menu];
export type TFeaturePermissionKey = (typeof PermissionKeys.feature)[keyof typeof PermissionKeys.feature];
