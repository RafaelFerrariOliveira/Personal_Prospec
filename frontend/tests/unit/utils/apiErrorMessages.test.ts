import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@domain/errors/api-error';
import { SESSION_EXPIRED_MESSAGE, toApiErrorMessages } from '@utils/apiErrorMessages';

const GENERIC = 'Mensagem genérica.';

const axiosFailure = (status: number): AxiosError =>
   new AxiosError('falha', String(status), undefined, null, { status } as AxiosResponse);

describe('toApiErrorMessages', () => {
   it('ApiError (400) devolve as mensagens do backend na ordem', () => {
      // Act
      const result = toApiErrorMessages(new ApiError(['Nome obrigatório.', 'CNAE repetido.'], 400), GENERIC);

      // Assert
      expect(result).toEqual(['Nome obrigatório.', 'CNAE repetido.']);
   });

   it('401 devolve a mensagem de sessão expirada', () => {
      // Act
      const result = toApiErrorMessages(axiosFailure(401), GENERIC);

      // Assert
      expect(result).toEqual([SESSION_EXPIRED_MESSAGE]);
      expect(SESSION_EXPIRED_MESSAGE).toBe('Sua sessão expirou. Entre novamente para continuar.');
   });

   it.each([
      ['500', axiosFailure(500)],
      ['409', axiosFailure(409)],
      ['erro de rede sem resposta', new AxiosError('Network Error')],
      ['erro comum com detalhe interno', new Error('stack interno')],
      ['valor que não é erro', 'texto'],
      ['undefined', undefined],
   ])('%s devolve só a mensagem genérica', (_name, failure) => {
      // Act
      const result = toApiErrorMessages(failure, GENERIC);

      // Assert
      expect(result).toEqual([GENERIC]);
   });
});
