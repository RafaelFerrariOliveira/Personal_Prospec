import { describe, expect, it } from 'vitest';
import { REFRESH_TOKEN_PATH } from '@axios/authentication.paths';
import { cookieSessionRefreshMiddleware } from '@axios/middlewares/cookieSessionRefreshMiddleware';
import { createTestInstance, type TStubHandler } from '../../../mocks/testUtils/httpAdapter';

type TScenario = { handler: TStubHandler; calls: string[] };

// protectedStatuses: sequência de status de /Algo/lista; refreshStatus: resposta do refresh.
const buildScenario = (refreshStatus: number, protectedStatuses: number[]): TScenario => {
   const calls: string[] = [];
   const queue = [...protectedStatuses];
   const handler: TStubHandler = async (config) => {
      calls.push(config.url ?? '');
      if (config.url === REFRESH_TOKEN_PATH) {
         await new Promise((resolve) => setTimeout(resolve, 5));
         return { status: refreshStatus };
      }
      return { status: queue.shift() ?? 200 };
   };
   return { handler, calls };
};

describe('cookieSessionRefreshMiddleware', () => {
   it('renova a sessão e reexecuta a requisição original após 401', async () => {
      // Arrange
      const { handler, calls } = buildScenario(200, [401, 200]);
      const instance = createTestInstance(handler, [cookieSessionRefreshMiddleware]);

      // Act
      const response = await instance.get('Algo/lista');

      // Assert
      expect(response.status).toBe(200);
      expect(calls).toEqual(['Algo/lista', REFRESH_TOKEN_PATH, 'Algo/lista']);
   });

   it('faz um único refresh para vários 401 simultâneos', async () => {
      // Arrange
      const { handler, calls } = buildScenario(200, [401, 401, 401, 200, 200, 200]);
      const instance = createTestInstance(handler, [cookieSessionRefreshMiddleware]);

      // Act
      const responses = await Promise.all([instance.get('Algo/a'), instance.get('Algo/b'), instance.get('Algo/c')]);

      // Assert
      expect(responses.map((response) => response.status)).toEqual([200, 200, 200]);
      expect(calls.filter((url) => url === REFRESH_TOKEN_PATH)).toHaveLength(1);
   });

   it('propaga o 401 original, sem laço, quando o refresh falha', async () => {
      // Arrange
      const { handler, calls } = buildScenario(401, [401]);
      const instance = createTestInstance(handler, [cookieSessionRefreshMiddleware]);

      // Act
      const request = instance.get('Algo/lista');

      // Assert
      await expect(request).rejects.toMatchObject({ response: { status: 401 }, config: { url: 'Algo/lista' } });
      expect(calls).toEqual(['Algo/lista', REFRESH_TOKEN_PATH]);
   });

   it('não tenta refresh em rota de autenticação', async () => {
      // Arrange
      const { handler, calls } = buildScenario(200, [401]);
      const instance = createTestInstance(handler, [cookieSessionRefreshMiddleware]);

      // Act
      const request = instance.post('Authentication/generate_access_token', {});

      // Assert
      await expect(request).rejects.toMatchObject({ response: { status: 401 } });
      expect(calls).toEqual(['Authentication/generate_access_token']);
   });

   it('renova também em get_session (bootstrap com access token expirado)', async () => {
      // Arrange
      const { handler, calls } = buildScenario(200, [401, 200]);
      const instance = createTestInstance(handler, [cookieSessionRefreshMiddleware]);

      // Act
      const response = await instance.get('Authentication/get_session');

      // Assert
      expect(response.status).toBe(200);
      expect(calls).toEqual(['Authentication/get_session', REFRESH_TOKEN_PATH, 'Authentication/get_session']);
   });

   it('não reexecuta mais de uma vez quando a requisição repetida também dá 401', async () => {
      // Arrange
      const { handler, calls } = buildScenario(200, [401, 401]);
      const instance = createTestInstance(handler, [cookieSessionRefreshMiddleware]);

      // Act
      const request = instance.get('Algo/lista');

      // Assert
      await expect(request).rejects.toMatchObject({ response: { status: 401 } });
      expect(calls).toEqual(['Algo/lista', REFRESH_TOKEN_PATH, 'Algo/lista']);
   });

   it('não interfere em erro diferente de 401', async () => {
      // Arrange
      const { handler, calls } = buildScenario(200, [500]);
      const instance = createTestInstance(handler, [cookieSessionRefreshMiddleware]);

      // Act
      const request = instance.get('Algo/lista');

      // Assert
      await expect(request).rejects.toMatchObject({ response: { status: 500 } });
      expect(calls).toEqual(['Algo/lista']);
   });
});
