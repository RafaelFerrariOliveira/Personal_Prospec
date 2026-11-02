import { evaluateAccessPolicy } from '@access/policies/evaluateAccessPolicy';
import { MENU_ACCESS_RULES } from '@access/policies/permissionMatrix';
import type { AccessContext } from '@access/types/access.types';
import type { TMenuPermissionKey } from '@access/types/permissionKeys';

export const canShowMenuItem = (context: AccessContext, menuKey: TMenuPermissionKey): boolean =>
   evaluateAccessPolicy(context, MENU_ACCESS_RULES[menuKey]);
