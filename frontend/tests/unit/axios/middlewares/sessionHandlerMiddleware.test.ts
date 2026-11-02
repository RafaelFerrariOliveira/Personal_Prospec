import { beforeEach, describe, expect, it } from 'vitest';
import { GENERATE_ACCESS_TOKEN_PATH } from '@axios/authentication.paths';
import { sessionHandlerMiddleware } from '@axios/middlewares/sessionHandlerMiddleware';
import {
   clearSession,
   selectCsrfToken,
   selectIsSessionBootstrapped,
   setCsrfToken,
} from '@store/reducers/session/sessionSlice';
import { clearUser, selectUser, setUser } from '@store/reducers/user/userSlice';
import store from '@store/store';
import { createTestInstance } from '../../../mocks/testUtils/httpAdapter';

const seedLoggedState = (): void => {
   store.dispatch(setCsrfToken('token-csrf'));
   store.dispatch(setUser({ email: 'a@b.com' }));
};

describe('sessionHandlerMiddleware', () => {
   beforeEach(() => {
      store.dispatch(clearSession());
      store.dispatch(clearUser());
   });

   it('limpa sessão e usuário em 401', async () => {
      // Arrange
      seedLoggedState();
      const instance = createTestInstance(() => ({ status: 401 }), [sessionHandlerMiddleware]);

      // Act
      await expect(instance.get('Algo/lista')).rejects.toMatchObject({ response: { status: 401 } });

      // Assert
      expect(selectCsrfToken(store.getState())).toBeNull();
      expect(selectUser(store.getState())).toBeNull();
   });

   it('mantém o estado em 401 com _skipAuthRedirect', async () => {
      // Arrange
      seedLoggedState();
      const instance = createTestInstance(() => ({ status: 401 }), [sessionHandlerMiddleware]);

      // Act
      await expect(instance.get('Authentication/refresh_token', { _skipAuthRedirect: true })).rejects.toBeDefined();

      // Assert
      expect(selectCsrfToken(store.getState())).toBe('token-csrf');
      expect(selectUser(store.getState())).toEqual({ email: 'a@b.com' });
   });

   it('mantém o estado em erro diferente de 401', async () => {
      // Arrange
      seedLoggedState();
      const instance = createTestInstance(() => ({ status: 500 }), [sessionHandlerMiddleware]);

      // Act
      await expect(instance.get('Algo/lista')).rejects.toBeDefined();

      // Assert
      expect(selectUser(store.getState())).toEqual({ email: 'a@b.com' });
   });

   it('marca a sessão como inicializada em 2xx do generate_access_token', async () => {
      // Arrange
      const instance = createTestInstance(() => ({ status: 200 }), [sessionHandlerMiddleware]);

      // Act
      await instance.post(GENERATE_ACCESS_TOKEN_PATH, {});

      // Assert
      expect(selectIsSessionBootstrapped(store.getState())).toBe(true);
   });

   it('não marca a sessão em 2xx de outra rota', async () => {
      // Arrange
      const instance = createTestInstance(() => ({ status: 200 }), [sessionHandlerMiddleware]);

      // Act
      await instance.get('Algo/lista');

      // Assert
      expect(selectIsSessionBootstrapped(store.getState())).toBe(false);
   });
});
