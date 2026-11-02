import type { TAccessPolicy, TAccessRule } from './accessPolicy.types';

export class AccessPolicyBuilder {
   private readonly rules: TAccessRule[] = [];

   static create(): AccessPolicyBuilder {
      return new AccessPolicyBuilder();
   }

   authenticatedOnly(): AccessPolicyBuilder {
      this.rules.push('authenticated');
      return this;
   }

   build(): TAccessPolicy {
      // Política sem regra liberaria tudo: falha explícita em vez de abrir acesso por engano.
      if (this.rules.length === 0) throw new Error('AccessPolicyBuilder: política sem nenhuma regra.');
      return { rules: [...this.rules] };
   }
}
