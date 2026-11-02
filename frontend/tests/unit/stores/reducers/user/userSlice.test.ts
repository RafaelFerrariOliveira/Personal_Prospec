import { describe, expect, it } from 'vitest';
import userReducer, { clearUser, selectUser, setUser, type TUserState } from '@store/reducers/user/userSlice';
import type { RootState } from '@store/store';

const INITIAL_STATE: TUserState = Object.freeze({ user: null });

const toRootState = (user: TUserState): RootState => ({
   session: { isSessionBootstrapped: false, csrfToken: null },
   user,
});

describe('userSlice', () => {
   it('começa sem usuário', () => {
      // Act
      const state = userReducer(undefined, { type: '@@INIT' });

      // Assert
      expect(state).toEqual(INITIAL_STATE);
   });

   it('guarda o usuário da sessão', () => {
      // Act
      const state = userReducer(INITIAL_STATE, setUser({ email: 'a@b.com' }));

      // Assert
      expect(selectUser(toRootState(state))).toEqual({ email: 'a@b.com' });
   });

   it('substitui o usuário anterior', () => {
      // Arrange
      const loggedState: TUserState = { user: { email: 'a@b.com' } };

      // Act
      const state = userReducer(loggedState, setUser({ email: 'c@d.com' }));

      // Assert
      expect(state.user).toEqual({ email: 'c@d.com' });
   });

   it('limpa o usuário', () => {
      // Arrange
      const loggedState: TUserState = { user: { email: 'a@b.com' } };

      // Act
      const state = userReducer(loggedState, clearUser());

      // Assert
      expect(selectUser(toRootState(state))).toBeNull();
   });

   it('clearUser sem usuário continua sem usuário', () => {
      // Act
      const state = userReducer(INITIAL_STATE, clearUser());

      // Assert
      expect(state).toEqual(INITIAL_STATE);
   });
});
