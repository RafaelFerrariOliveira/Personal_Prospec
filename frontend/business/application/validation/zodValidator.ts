import type { ZodType } from 'zod';
import type { ILogger } from '@domain/contracts/i-logger';

/** Valida a resposta da API; em falha, registra os issues (sem o payload) e devolve o fallback. */
export const zodValidator = <T, F>(
   schema: ZodType<T>,
   data: unknown,
   defaultReturn: F,
   method: string,
   logger: ILogger,
): T | F => {
   const parsed = schema.safeParse(data);

   if (!parsed.success) {
      logger.warn('Zod validation failed', {
         method,
         issues: parsed.error.issues,
      });
      return defaultReturn;
   }

   return parsed.data;
};
