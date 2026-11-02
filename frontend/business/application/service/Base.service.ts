import { inject, optional } from 'inversify';
import type { ZodType } from 'zod';
import { http } from '@axios/axios.instance';
import type { ApiControllerName } from '@api/api.controllers';
import { zodValidator } from '@application/validation/zodValidator';
import type { ILogger } from '@domain/contracts/i-logger';
import { LoggerSymbol } from '@ioc/references/logger.symbols';

export type TExecuteOptions<T> = {
   fallback?: T;
   rethrow?: boolean;
   context?: Record<string, unknown>;
   logSuccess?: boolean;
};

// Usado quando o logger não está registrado no IoC (ex.: teste unitário de service sem container).
const NULL_LOGGER: ILogger = {
   debug: () => undefined,
   info: () => undefined,
   warn: () => undefined,
   error: () => undefined,
   child: () => NULL_LOGGER,
};

/**
 * Base de todo XxxService (ver services-di-ioc.md): instância http única, execute (log + erro padronizado),
 * validateResponse (Zod) e buildPath (api/<Controller>/<acao> relativo ao baseURL).
 */
export abstract class BaseService {
   protected http = http;
   protected readonly _logger: ILogger;

   constructor(@inject(LoggerSymbol) @optional() logger?: ILogger) {
      this._logger = logger ?? NULL_LOGGER;
   }

   protected buildPath(controller: ApiControllerName, action: string): string {
      return `${controller}/${action}`;
   }

   protected validateResponse<T, F>(schema: ZodType<T>, data: unknown, defaultReturn: F, method: string): T | F {
      return zodValidator(schema, data, defaultReturn, method, this._logger);
   }

   protected async execute<T>(method: string, operation: () => Promise<T>, options?: TExecuteOptions<T>): Promise<T> {
      const serviceName = this.constructor.name;
      const scopedLogger = this._logger.child({ service: serviceName, method });
      const startTime = Date.now();

      try {
         const result = await operation();
         const successContext = { durationMs: Date.now() - startTime, ...(options?.context ?? {}) };

         if (options?.logSuccess) {
            scopedLogger.info('Service operation succeeded', successContext);
         } else {
            scopedLogger.debug('Service operation succeeded', successContext);
         }

         return result;
      } catch (error: unknown) {
         scopedLogger.error('Service operation failed', error, {
            durationMs: Date.now() - startTime,
            ...(options?.context ?? {}),
         });

         if (options?.fallback !== undefined) {
            return options.fallback;
         }

         if (options?.rethrow === false) {
            return undefined as unknown as T;
         }

         throw error;
      }
   }
}
