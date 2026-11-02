import { evaluateAccessPolicy } from '@access/policies/evaluateAccessPolicy';
import { DEFAULT_ROUTE_ACCESS_POLICY, ROUTE_ACCESS_RULES } from '@access/policies/permissionMatrix';
import type { AccessContext } from '@access/types/access.types';

export const canAccessRoute = (context: AccessContext, path: string): boolean =>
   evaluateAccessPolicy(context, ROUTE_ACCESS_RULES[path] ?? DEFAULT_ROUTE_ACCESS_POLICY);
