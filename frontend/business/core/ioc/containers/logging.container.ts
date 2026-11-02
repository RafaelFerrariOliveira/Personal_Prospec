import type { Container } from 'inversify';
import type { ILogger } from '@domain/contracts/i-logger';
import { ConsoleLogger } from '@infrastructure/logging/ConsoleLogger';
import { LoggerSymbol } from '@ioc/references/logger.symbols';

export const loadLoggingContainer = (container: Container): void => {
   container
      .bind<ILogger>(LoggerSymbol)
      .toDynamicValue(() => new ConsoleLogger())
      .inSingletonScope();
};
