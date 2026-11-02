import { describe, expect, it } from 'vitest';
import { ZLoginRequestSchema } from '@request/login.request';

describe('ZLoginRequestSchema', () => {
   it('normaliza o e-mail com trim e minúsculas', () => {
      // Act
      const result = ZLoginRequestSchema.parse({ email: '  Usuario@Exemplo.COM ', password: 'senha' });

      // Assert
      expect(result).toEqual({ email: 'usuario@exemplo.com', password: 'senha' });
   });

   it('não altera a senha (espaços e caixa preservados)', () => {
      // Act
      const result = ZLoginRequestSchema.parse({ email: 'a@b.com', password: ' Senha ' });

      // Assert
      expect(result.password).toBe(' Senha ');
   });

   it('recusa senha vazia', () => {
      // Act
      const result = ZLoginRequestSchema.safeParse({ email: 'a@b.com', password: '' });

      // Assert
      expect(result.error?.issues[0]?.message).toBe('Informe a senha.');
   });

   it('recusa e-mail vazio ou só com espaços', () => {
      // Act
      const result = ZLoginRequestSchema.safeParse({ email: '   ', password: 'x' });

      // Assert
      expect(result.error?.issues[0]?.message).toBe('Informe o e-mail.');
   });

   it('recusa e-mail em formato inválido', () => {
      // Act
      const result = ZLoginRequestSchema.safeParse({ email: 'sem-arroba', password: 'x' });

      // Assert
      expect(result.error?.issues[0]?.message).toBe('Informe um e-mail válido.');
   });
});
