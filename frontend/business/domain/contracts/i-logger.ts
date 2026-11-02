export type TLogLevel = 'debug' | 'info' | 'warn' | 'error';

export type TLogContext = {
   service?: string;
   method?: string;
   correlationId?: string;
   durationMs?: number;
   [key: string]: unknown;
};

export interface ILogger {
   debug(message: string, context?: TLogContext): void;
   info(message: string, context?: TLogContext): void;
   warn(message: string, context?: TLogContext): void;
   error(message: string, error?: unknown, context?: TLogContext): void;
   child(context: TLogContext): ILogger;
}
