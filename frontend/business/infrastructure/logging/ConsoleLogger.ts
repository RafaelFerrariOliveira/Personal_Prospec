import type { ILogger, TLogContext } from '@domain/contracts/i-logger';

/**
 * Implementação de ILogger sobre o console do navegador.
 * debug/info só saem quando isDebugEnabled (padrão: ambiente de desenvolvimento); em produção ficam só warn/error.
 * Nunca registrar payload completo de request/response (ver security-frontend.md).
 */
export class ConsoleLogger implements ILogger {
   private readonly baseContext: TLogContext;
   private readonly isDebugEnabled: boolean;

   constructor(baseContext: TLogContext = {}, isDebugEnabled: boolean = import.meta.env.DEV) {
      this.baseContext = baseContext;
      this.isDebugEnabled = isDebugEnabled;
   }

   debug(message: string, context?: TLogContext): void {
      if (!this.isDebugEnabled) return;
      console.debug(message, this.mergeContext(context));
   }

   info(message: string, context?: TLogContext): void {
      if (!this.isDebugEnabled) return;
      console.info(message, this.mergeContext(context));
   }

   warn(message: string, context?: TLogContext): void {
      console.warn(message, this.mergeContext(context));
   }

   error(message: string, error?: unknown, context?: TLogContext): void {
      console.error(message, error, this.mergeContext(context));
   }

   child(context: TLogContext): ILogger {
      return new ConsoleLogger(this.mergeContext(context), this.isDebugEnabled);
   }

   private mergeContext(context?: TLogContext): TLogContext {
      return { ...this.baseContext, ...(context ?? {}) };
   }
}
