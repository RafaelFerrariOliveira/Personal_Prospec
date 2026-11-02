import { evaluateAccessPolicy } from '@access/policies/evaluateAccessPolicy';
import { FEATURE_ACCESS_RULES } from '@access/policies/permissionMatrix';
import type { AccessContext } from '@access/types/access.types';
import type { TFeaturePermissionKey } from '@access/types/permissionKeys';

export const canUseFeature = (context: AccessContext, key: TFeaturePermissionKey): boolean =>
   evaluateAccessPolicy(context, FEATURE_ACCESS_RULES[key]);
