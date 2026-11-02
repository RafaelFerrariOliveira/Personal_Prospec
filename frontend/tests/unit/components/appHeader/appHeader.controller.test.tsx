import { act, renderHook } from '@testing-library/react';
import type { NavigateFunction } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import UseAppHeaderController from '@components/appHeader/appHeader.controller';
import type { IAuthenticationService } from '@interfaces/authentication.interface';
import { RoutePaths } from '@routes/routePaths';
import { clearSession } from '@store/reducers/session/sessionSlice';
import { clearUser } from '@store/reducers/user/userSlice';
import type { AppDispatch } from '@store/store';

const setup = (logout: () => Promise<void>, email: string | null = 'a@b.com') => {
   const navigate = vi.fn();
   const dispatch = vi.fn();
   const service = { login: vi.fn(), logout, getSession: vi.fn() } as unknown as IAuthenticationService;
   const { result } = renderHook(() =>
      UseAppHeaderController({
         authenticationService: service,
         navigate: navigate as unknown as NavigateFunction,
         dispatch: dispatch as unknown as AppDispatch,
         email,
      }),
   );
   return { result, navigate, dispatch };
};

describe('UseAppHeaderController', () => {
   it('sair limpa sessão e usuário e navega para o login', async () => {
      // Arrange
      const logout = vi.fn().mockResolvedValue(undefined);
      const { result, navigate, dispatch } = setup(logout);

      // Act
      await act(async () => {
         await result.current.onLogout();
      });

      // Assert
      expect(logout).toHaveBeenCalledTimes(1);
      expect(dispatch.mock.calls).toEqual([[clearSession()], [clearUser()]]);
      expect(navigate).toHaveBeenCalledWith(RoutePaths.login);
   });

   it('falha ao sair mantém a sessão, mostra erro e libera o botão', async () => {
      // Arrange
      const { result, navigate, dispatch } = setup(vi.fn().mockRejectedValue(new Error('rede')));

      // Act
      await act(async () => {
         await result.current.onLogout();
      });

      // Assert
      expect(dispatch).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
      expect(result.current.errorMessage).toBe('Não foi possível sair. Tente novamente.');
      expect(result.current.isLoggingOut).toBe(false);
   });

   it('fica em loading enquanto o logout não termina', async () => {
      // Arrange
      let finish: () => void = () => undefined;
      const { result } = setup(() => new Promise<void>((resolve) => (finish = resolve)));

      // Act
      let pending: Promise<void> = Promise.resolve();
      act(() => {
         pending = result.current.onLogout();
      });

      // Assert
      expect(result.current.isLoggingOut).toBe(true);
      expect(result.current.isLogoutDisabled).toBe(true);
      await act(async () => {
         finish();
         await pending;
      });
   });

   it('sem e-mail o botão de sair fica desabilitado', () => {
      // Act
      const { result } = setup(vi.fn(), null);

      // Assert
      expect(result.current.isLogoutDisabled).toBe(true);
   });
});
