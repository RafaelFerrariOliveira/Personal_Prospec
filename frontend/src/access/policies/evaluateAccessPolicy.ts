import type { AccessContext } from '@access/types/access.types';
import type { TAccessPolicy, TAccessRule } from './accessPolicy.types';

const RULE_CHECKS: Record<TAccessRule, (context: AccessContext) => boolean> = {
   authenticated: (context) => context.isAuthenticated,
};

export const evaluateAccessPolicy = (context: AccessContext, policy: TAccessPolicy): boolean =>
   policy.rules.every((rule) => RULE_CHECKS[rule](context));
