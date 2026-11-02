import { canUseFeature } from '@access/handlers/FeatureAccessHandler';
import { canShowMenuItem } from '@access/handlers/MenuAccessHandler';
import { canAccessRoute } from '@access/handlers/RouteAccessHandler';
import type { AccessContext } from '@access/types/access.types';
import type { TFeaturePermissionKey, TMenuPermissionKey } from '@access/types/permissionKeys';

export interface IAccessControl {
   canAccessRoute: (path: string) => boolean;
   canShowMenuItem: (menuKey: TMenuPermissionKey) => boolean;
   canUseFeature: (key: TFeaturePermissionKey) => boolean;
}

export const createAccessControl = (context: AccessContext): IAccessControl => ({
   canAccessRoute: (path) => canAccessRoute(context, path),
   canShowMenuItem: (menuKey) => canShowMenuItem(context, menuKey),
   canUseFeature: (key) => canUseFeature(context, key),
});
