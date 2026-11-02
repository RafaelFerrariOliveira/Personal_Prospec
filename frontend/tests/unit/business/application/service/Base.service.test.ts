import { describe, expect, it, vi } from 'vitest';
import { z, type ZodType } from 'zod';
import type { ApiControllerName } from '@api/api.controllers';
import { BaseService, type TExecuteOptions } from '@application/service/Base.service';
import type { ILogger } from '@domain/contracts/i-logger';

// Subclasse de teste: expõe os métodos protegidos da base.
class TestService extends BaseService {
   public run<T>(operation: () => Promise<T>, options?: TExecuteOptions<T>): Promise<T> {
      return this.execute('run', operation, options);
   }

   public validate<T, F>(schema: ZodType<T>, data: unknown, fallback: F): T | F {
      return this.validateResponse(schema, data, fallback, 'TestService.validate');
   }

   public path(controller: ApiControllerName, action: string): string {
      return this.buildPath(controller, action);
   }
}

const createLoggerMock = () => {
   const logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      child: vi.fn(),
   };
   logger.child.mockReturnValue(logger);
   return logger;
};

describe('BaseService', () => {
   it('devolve o resultado da operação e registra debug no sucesso', async () => {
      // Arrange
      const logger = createLoggerMock();
      const service = new TestService(logger as unknown as ILogger);

      // Act
      const result = await service.run(async () => 42);

      // Assert
      expect(result).toBe(42);
      expect(logger.child).toHaveBeenCalledWith({ service: 'TestService', method: 'run' });
      expect(logger.debug).toHaveBeenCalledTimes(1);
      expect(logger.info).not.toHaveBeenCalled();
   });

   it('registra info no sucesso quando logSuccess é true', async () => {
      // Arrange
      const logger = createLoggerMock();
      const service = new TestService(logger as unknown as ILogger);

      // Act
      await service.run(async () => 'ok', { logSuccess: true, context: { origin: 'test' } });

      // Assert
      expect(logger.info).toHaveBeenCalledWith(
         'Service operation succeeded',
         expect.objectContaining({ origin: 'test' }),
      );
   });

   it('relança o erro por padrão depois de registrar a falha', async () => {
      // Arrange
      const logger = createLoggerMock();
      const service = new TestService(logger as unknown as ILogger);
      const failure = new Error('falha na API');

      // Act
      const execution = service.run(async () => Promise.reject(failure), { rethrow: true });

      // Assert
      await expect(execution).rejects.toBe(failure);
      expect(logger.error).toHaveBeenCalledWith('Service operation failed', failure, expect.any(Object));
   });

   it('devolve o fallback quando a operação falha e há fallback', async () => {
      // Arrange
      const service = new TestService(createLoggerMock() as unknown as ILogger);

      // Act
      const result = await service.run<string[]>(async () => Promise.reject(new Error('falha')), { fallback: [] });

      // Assert
      expect(result).toEqual([]);
   });

   it('devolve undefined quando a operação falha com rethrow false', async () => {
      // Arrange
      const service = new TestService(createLoggerMock() as unknown as ILogger);

      // Act
      const result = await service.run(async () => Promise.reject(new Error('falha')), { rethrow: false });

      // Assert
      expect(result).toBeUndefined();
   });

   it('funciona sem logger registrado (logger nulo)', async () => {
      // Arrange
      const service = new TestService();

      // Act
      const result = await service.run(async () => 'sem logger');

      // Assert
      expect(result).toBe('sem logger');
   });

   it('valida a resposta com o schema e devolve o dado parseado', () => {
      // Arrange
      const service = new TestService(createLoggerMock() as unknown as ILogger);

      // Act
      const result = service.validate(z.object({ id: z.number() }), { id: 7 }, null);

      // Assert
      expect(result).toEqual({ id: 7 });
   });

   it('devolve o fallback quando a resposta não bate com o schema', () => {
      // Arrange
      const logger = createLoggerMock();
      const service = new TestService(logger as unknown as ILogger);

      // Act
      const result = service.validate(z.object({ id: z.number() }), { id: 'x' }, null);

      // Assert
      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(
         'Zod validation failed',
         expect.objectContaining({ method: 'TestService.validate' }),
      );
   });

   it('monta o path <Controller>/<acao> relativo ao baseURL', () => {
      // Arrange
      const service = new TestService(createLoggerMock() as unknown as ILogger);

      // Act
      const result = service.path('Customer' as ApiControllerName, 'get_by_id_customer');

      // Assert
      expect(result).toBe('Customer/get_by_id_customer');
   });
});
