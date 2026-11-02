import { describe, expect, it, vi } from 'vitest';
import { createLoggingHandler } from '@axios/middlewares/loggingHandler';
import type { ILogger } from '@domain/contracts/i-logger';
import { createTestInstance } from '../../../mocks/testUtils/httpAdapter';

const createLoggerSpy = (): ILogger => {
   const logger: ILogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      child: () => logger,
   };
   return logger;
};

const allLogged = (logger: ILogger): string =>
   JSON.stringify([
      vi.mocked(logger.debug).mock.calls,
      vi.mocked(logger.warn).mock.calls,
      vi.mocked(logger.error).mock.calls,
   ]);

describe('loggingHandler', () => {
   it('loga método, URL sem query e status da resposta', async () => {
      // Arrange
      const logger = createLoggerSpy();
      const instance = createTestInstance(() => ({ status: 200 }), [createLoggingHandler(logger)]);

      // Act
      await instance.get('Algo/lista?busca=segredo');

      // Assert
      expect(logger.debug).toHaveBeenCalledWith('HTTP response', { method: 'GET', url: 'Algo/lista', status: 200 });
   });

   it('loga método, URL e status do erro', async () => {
      // Arrange
      const logger = createLoggerSpy();
      const instance = createTestInstance(() => ({ status: 500 }), [createLoggingHandler(logger)]);

      // Act
      await expect(instance.post('Algo/criar', {})).rejects.toBeDefined();

      // Assert
      expect(logger.warn).toHaveBeenCalledWith('HTTP error', { method: 'POST', url: 'Algo/criar', status: 500 });
   });

   it('nunca loga payload, query, cookie nem header de autorização', async () => {
      // Arrange
      const logger = createLoggerSpy();
      const instance = createTestInstance(
         () => ({ status: 200, data: { retorno: 'DADO-RESPOSTA' } }),
         [createLoggingHandler(logger)],
      );

      // Act
      await instance.post(
         'Algo/criar?token=QUERY-SECRETA',
         { senha: 'SENHA-SECRETA' },
         { headers: { Authorization: 'Bearer HEADER-SECRETO', Cookie: 'COOKIE-SECRETO' } },
      );

      // Assert
      const logged = allLogged(logger);
      ['SENHA-SECRETA', 'QUERY-SECRETA', 'HEADER-SECRETO', 'COOKIE-SECRETO', 'DADO-RESPOSTA'].forEach((secret) =>
         expect(logged).not.toContain(secret),
      );
   });
});
