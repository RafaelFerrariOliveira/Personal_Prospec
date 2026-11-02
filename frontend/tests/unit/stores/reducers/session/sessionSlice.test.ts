import { describe, expect, it } from 'vitest';
import sessionReducer, {
   clearSession,
   markSessionBootstrapped,
   selectCsrfToken,
   selectIsSessionBootstrapped,
   setCsrfToken,
   type TSessionState,
} from '@store/reducers/session/sessionSlice';
import type { RootState } from '@store/store';

const INITIAL_STATE: TSessionState = Object.freeze({ isSessionBootstrapped: false, csrfToken: null });

const toRootState = (session: TSessionState): RootState => ({ session, user: { user: null } });

describe('sessionSlice', () => {
   it('começa sem token CSRF e sem sessão inicializada', () => {
      // Arrange
      const action = { type: '@@INIT' };

      // Act
      const state = sessionReducer(undefined, action);

      // Assert
      expect(state).toEqual(INITIAL_STATE);
   });

   it('guarda o token CSRF', () => {
      // Arrange
      const action = setCsrfToken('token-csrf');

      // Act
      const state = sessionReducer(INITIAL_STATE, action);

      // Assert
      expect(selectCsrfToken(toRootState(state))).toBe('token-csrf');
   });

   it('marca a sessão como inicializada', () => {
      // Arrange
      const action = markSessionBootstrapped();

      // Act
      const state = sessionReducer(INITIAL_STATE, action);

      // Assert
      expect(selectIsSessionBootstrapped(toRootState(state))).toBe(true);
   });

   it('limpa token e sessão ao encerrar', () => {
      // Arrange
      const activeState: TSessionState = { isSessionBootstrapped: true, csrfToken: 'token-csrf' };

      // Act
      const state = sessionReducer(activeState, clearSession());

      // Assert
      expect(state).toEqual(INITIAL_STATE);
   });
});
