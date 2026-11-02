import { isAxiosError } from 'axios';
import { ApiError } from '@domain/errors/api-error';

export const SESSION_EXPIRED_MESSAGE = 'Sua sessão expirou. Entre novamente para continuar.';

/**
 * Mensagens para a UI a partir de um erro de chamada à API: 400 mostra as mensagens do backend,
 * 401 avisa a sessão, o resto (500, rede, desconhecido) vira a mensagem genérica, nunca detalhe interno.
 */
export const toApiErrorMessages = (error: unknown, genericMessage: string): string[] => {
   if (error instanceof ApiError) return error.messages;
   if (isAxiosError(error) && error.response?.status === 401) return [SESSION_EXPIRED_MESSAGE];
   return [genericMessage];
};
