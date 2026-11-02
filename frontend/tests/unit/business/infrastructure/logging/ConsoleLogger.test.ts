import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConsoleLogger } from '@infrastructure/logging/ConsoleLogger';

describe('ConsoleLogger', () => {
   afterEach(() => {
      vi.restoreAllMocks();
   });

   it('escreve debug e info quando o debug está habilitado', () => {
      // Arrange
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
      const logger = new ConsoleLogger({ service: 'S' }, true);

      // Act
      logger.debug('mensagem debug', { method: 'm' });
      logger.info('mensagem info');

      // Assert
      expect(debugSpy).toHaveBeenCalledWith('mensagem debug', { service: 'S', method: 'm' });
      expect(infoSpy).toHaveBeenCalledWith('mensagem info', { service: 'S' });
   });

   it('suprime debug e info quando o debug está desabilitado (produção)', () => {
      // Arrange
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
      const logger = new ConsoleLogger({}, false);

      // Act
      logger.debug('nao sai');
      logger.info('nao sai');

      // Assert
      expect(debugSpy).not.toHaveBeenCalled();
      expect(infoSpy).not.toHaveBeenCalled();
   });

   it('sempre escreve warn e error', () => {
      // Arrange
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const logger = new ConsoleLogger({}, false);
      const failure = new Error('falha');

      // Act
      logger.warn('aviso');
      logger.error('erro', failure, { method: 'm' });

      // Assert
      expect(warnSpy).toHaveBeenCalledWith('aviso', {});
      expect(errorSpy).toHaveBeenCalledWith('erro', failure, { method: 'm' });
   });

   it('child herda e sobrescreve o contexto do pai', () => {
      // Arrange
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const parent = new ConsoleLogger({ service: 'Pai', method: 'a' }, false);

      // Act
      parent.child({ method: 'b' }).warn('aviso do filho');

      // Assert
      expect(warnSpy).toHaveBeenCalledWith('aviso do filho', { service: 'Pai', method: 'b' });
   });
});
