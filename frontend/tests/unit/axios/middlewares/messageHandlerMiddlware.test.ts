import { describe, expect, it } from 'vitest';
import { ApiError } from '@domain/errors/api-error';
import { messageHandlerMiddlware } from '@axios/middlewares/messageHandlerMiddlware';
import { createTestInstance } from '../../../mocks/testUtils/httpAdapter';

describe('messageHandlerMiddlware', () => {
   it('converte 400 com lista de notifications em ApiError com as mensagens', async () => {
      // Arrange
      const data = [
         { key: 'Email', value: 'E-mail inválido.' },
         { key: 'Senha', value: 'Senha obrigatória.' },
      ];
      const instance = createTestInstance(() => ({ status: 400, data }), [messageHandlerMiddlware]);

      // Act
      const error: unknown = await instance.post('Authentication/x', {}).catch((caught: unknown) => caught);

      // Assert
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ messages: ['E-mail inválido.', 'Senha obrigatória.'], status: 400 });
   });

   it('mantém o erro original quando o 400 não tem o formato de notifications', async () => {
      // Arrange
      const instance = createTestInstance(() => ({ status: 400, data: { title: 'x' } }), [messageHandlerMiddlware]);

      // Act
      const error: unknown = await instance.get('Algo/lista').catch((caught: unknown) => caught);

      // Assert
      expect(error).not.toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ response: { status: 400 } });
   });

   it('mantém o erro original quando a lista de notifications está vazia', async () => {
      // Arrange
      const instance = createTestInstance(() => ({ status: 400, data: [] }), [messageHandlerMiddlware]);

      // Act
      const error: unknown = await instance.get('Algo/lista').catch((caught: unknown) => caught);

      // Assert
      expect(error).not.toBeInstanceOf(ApiError);
   });

   it.each([401, 403, 404, 409, 500])('não converte o status %i', async (status) => {
      // Arrange
      const data = [{ key: 'k', value: 'm' }];
      const instance = createTestInstance(() => ({ status, data }), [messageHandlerMiddlware]);

      // Act
      const error: unknown = await instance.get('Algo/lista').catch((caught: unknown) => caught);

      // Assert
      expect(error).not.toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ response: { status } });
   });
});
