import { describe, expect, it } from 'vitest';
import type { ILogger } from '@domain/contracts/i-logger';
import { ConsoleLogger } from '@infrastructure/logging/ConsoleLogger';
import { containerIoC, resolveContainer } from '@ioc/ioc.config';
import { LoggerSymbol } from '@ioc/references/logger.symbols';

describe('ioc.config', () => {
   it('registra o logger como ConsoleLogger', () => {
      // Arrange
      const symbol = LoggerSymbol;

      // Act
      const logger = resolveContainer<ILogger>(symbol);

      // Assert
      expect(logger).toBeInstanceOf(ConsoleLogger);
   });

   it('resolve o logger como singleton', () => {
      // Arrange
      const first = containerIoC.get<ILogger>(LoggerSymbol);

      // Act
      const second = containerIoC.get<ILogger>(LoggerSymbol);

      // Assert
      expect(second).toBe(first);
   });
});
