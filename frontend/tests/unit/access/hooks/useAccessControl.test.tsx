import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import { useAccessControl } from '@access/hooks/useAccessControl';
import { rootReducer } from '@store/combineReducers';

const renderWithUser = (email: string | null) => {
   const store = configureStore({
      reducer: rootReducer,
      preloadedState: {
         session: { isSessionBootstrapped: true, csrfToken: null },
         user: { user: email ? { email } : null },
      },
   });
   const wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
   return renderHook(() => useAccessControl(), { wrapper });
};

describe('useAccessControl', () => {
   it('usuário autenticado acessa rota privada', () => {
      // Act
      const { result } = renderWithUser('a@b.com');

      // Assert
      expect(result.current.canAccessRoute('/qualquer')).toBe(true);
   });

   it('sem usuário não acessa rota privada', () => {
      // Act
      const { result } = renderWithUser(null);

      // Assert
      expect(result.current.canAccessRoute('/qualquer')).toBe(false);
   });

   it('mantém a mesma referência entre renders quando o usuário não muda', () => {
      // Arrange
      const { result, rerender } = renderWithUser('a@b.com');
      const first = result.current;

      // Act
      rerender();

      // Assert
      expect(result.current).toBe(first);
   });
});
