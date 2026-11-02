import { AccessPolicyBuilder } from './accessPolicyBuilder';

export const AccessPresets = {
   authenticated: AccessPolicyBuilder.create().authenticatedOnly().build(),
} as const;
