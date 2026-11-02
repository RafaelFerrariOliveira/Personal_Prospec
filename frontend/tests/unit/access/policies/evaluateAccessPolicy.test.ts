import { describe, expect, it } from 'vitest';
import { AccessPolicyBuilder } from '@access/policies/accessPolicyBuilder';
import { AccessPresets } from '@access/policies/accessPresets';
import { evaluateAccessPolicy } from '@access/policies/evaluateAccessPolicy';

describe('evaluateAccessPolicy', () => {
   it('libera o preset authenticated para usuário autenticado', () => {
      // Act
      const allowed = evaluateAccessPolicy({ isAuthenticated: true }, AccessPresets.authenticated);

      // Assert
      expect(allowed).toBe(true);
   });

   it('bloqueia o preset authenticated sem usuário', () => {
      // Act
      const allowed = evaluateAccessPolicy({ isAuthenticated: false }, AccessPresets.authenticated);

      // Assert
      expect(allowed).toBe(false);
   });

   it('o builder gera a política com a regra authenticated', () => {
      // Act
      const policy = AccessPolicyBuilder.create().authenticatedOnly().build();

      // Assert
      expect(policy).toEqual({ rules: ['authenticated'] });
   });

   it('o builder recusa política sem regra para não liberar acesso por engano', () => {
      // Act
      const build = (): unknown => AccessPolicyBuilder.create().build();

      // Assert
      expect(build).toThrow('sem nenhuma regra');
   });
});
