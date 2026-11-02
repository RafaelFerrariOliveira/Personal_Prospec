import { beforeEach, describe, expect, it } from 'vitest';
import { CSRF_HEADER, csrfHandlerMiddleware } from '@axios/middlewares/csrfHandlerMiddleware';
import { clearSession, setCsrfToken } from '@store/reducers/session/sessionSlice';
import store from '@store/store';
import { createTestInstance } from '../../../mocks/testUtils/httpAdapter';

const captureHeaders = async (method: 'get' | 'post' | 'put' | 'delete' | 'patch'): Promise<string | undefined> => {
   let sent: string | undefined;
   const instance = createTestInstance(
      (config) => {
         sent = config.headers.get(CSRF_HEADER)?.toString();
         return { status: 200 };
      },
      [csrfHandlerMiddleware],
   );
   await instance.request({ url: 'X/y', method });
   return sent;
};

describe('csrfHandlerMiddleware', () => {
   beforeEach(() => {
      store.dispatch(clearSession());
   });

   it.each(['post', 'put', 'delete', 'patch'] as const)('injeta o token em %s', async (method) => {
      // Arrange
      store.dispatch(setCsrfToken('token-csrf'));

      // Act
      const header = await captureHeaders(method);

      // Assert
      expect(header).toBe('token-csrf');
   });

   it('não injeta o token em GET', async () => {
      // Arrange
      store.dispatch(setCsrfToken('token-csrf'));

      // Act
      const header = await captureHeaders('get');

      // Assert
      expect(header).toBeUndefined();
   });

   it('não injeta header quando a store não tem token', async () => {
      // Act
      const header = await captureHeaders('post');

      // Assert
      expect(header).toBeUndefined();
   });
});
