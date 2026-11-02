import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import type { NavigateFunction } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PermissionKeys, type TMenuPermissionKey } from '@access/types/permissionKeys';
import UseSidebarController from '@components/sidebar/sidebar.controller';
import type { ISidebarControllerDeps } from '@components/sidebar/sidebar.types';
import SidebarView from '@components/sidebar/sidebar.view';
import type { IAuthenticationService } from '@interfaces/authentication.interface';
import { RoutePaths } from '@routes/routePaths';
import { clearSession } from '@store/reducers/session/sessionSlice';
import { clearUser } from '@store/reducers/user/userSlice';
import type { AppDispatch } from '@store/store';

type TOverrides = {
   logout?: () => Promise<void>;
   email?: string | null;
   pathname?: string;
   canShowMenuItem?: (menuKey: TMenuPermissionKey) => boolean;
};

const createDeps = (overrides: TOverrides = {}) => {
   const navigate = vi.fn();
   const dispatch = vi.fn();
   const service = {
      login: vi.fn(),
      logout: overrides.logout ?? vi.fn().mockResolvedValue(undefined),
      getSession: vi.fn(),
   } as unknown as IAuthenticationService;
   const deps: ISidebarControllerDeps = {
      authenticationService: service,
      navigate: navigate as unknown as NavigateFunction,
      dispatch: dispatch as unknown as AppDispatch,
      email: overrides.email === undefined ? 'usuario@exemplo.com' : overrides.email,
      pathname: overrides.pathname ?? RoutePaths.home,
      canShowMenuItem: overrides.canShowMenuItem ?? (() => true),
   };
   return { deps, navigate, dispatch };
};

const Harness = ({ deps }: { deps: ISidebarControllerDeps }) => <SidebarView {...UseSidebarController(deps)} />;

describe('UseSidebarController: menu', () => {
   it('mostra Home e Campanhas, marcando a página atual', () => {
      // Arrange
      const { deps } = createDeps({ pathname: RoutePaths.home });

      // Act
      render(<Harness deps={deps} />);

      // Assert
      expect(screen.getByTestId('sidebar-nav-home').getAttribute('aria-current')).toBe('page');
      expect(screen.getByTestId('sidebar-nav-campaigns').getAttribute('aria-current')).toBeNull();
      expect(screen.getByTestId('brand').textContent).toBe('Personal Prospec');
   });

   it.each(['/campaigns', '/campaigns/new', '/campaigns/abc/edit'])(
      'em %s o item Campanhas fica marcado',
      (pathname) => {
         // Arrange
         const { deps } = createDeps({ pathname });

         // Act
         render(<Harness deps={deps} />);

         // Assert
         expect(screen.getByTestId('sidebar-nav-campaigns').getAttribute('aria-current')).toBe('page');
         expect(screen.getByTestId('sidebar-nav-home').getAttribute('aria-current')).toBeNull();
      },
   );

   it('cada item passa pela policy de menu: sem permissão, o item não aparece', () => {
      // Arrange
      const canShowMenuItem = vi.fn((menuKey: TMenuPermissionKey) => menuKey === PermissionKeys.menu.home);
      const { deps } = createDeps({ canShowMenuItem });

      // Act
      render(<Harness deps={deps} />);

      // Assert
      expect(screen.getByTestId('sidebar-nav-home')).toBeTruthy();
      expect(screen.queryByTestId('sidebar-nav-campaigns')).toBeNull();
      expect(canShowMenuItem).toHaveBeenCalledWith(PermissionKeys.menu.campaigns);
   });

   it('clicar no item navega para a rota dele', () => {
      // Arrange
      const { deps, navigate } = createDeps();
      render(<Harness deps={deps} />);

      // Act
      fireEvent.click(screen.getByTestId('sidebar-nav-campaigns'));
      fireEvent.click(screen.getByTestId('sidebar-nav-home'));

      // Assert
      expect(navigate.mock.calls).toEqual([[RoutePaths.campaigns], [RoutePaths.home]]);
   });

   it('mostra o e-mail do usuário e a inicial no avatar', () => {
      // Arrange
      const { deps } = createDeps({ email: 'rafael@exemplo.com' });

      // Act
      const { result } = renderHook(() => UseSidebarController(deps));
      render(<SidebarView {...result.current} />);

      // Assert
      expect(screen.getByTestId('sidebar-email').textContent).toBe('rafael@exemplo.com');
      expect(result.current.avatarLetter).toBe('R');
   });
});

describe('UseSidebarController: sair', () => {
   it('sair limpa sessão e usuário e navega para o login', async () => {
      // Arrange
      const logout = vi.fn().mockResolvedValue(undefined);
      const { deps, navigate, dispatch } = createDeps({ logout });
      const { result } = renderHook(() => UseSidebarController(deps));

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
      const { deps, navigate, dispatch } = createDeps({ logout: vi.fn().mockRejectedValue(new Error('rede')) });
      render(<Harness deps={deps} />);

      // Act
      await act(async () => {
         fireEvent.click(screen.getByTestId('sidebar-logout'));
      });

      // Assert
      expect(dispatch).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
      expect(screen.getByTestId('sidebar-error').textContent).toBe('Não foi possível sair. Tente novamente.');
      expect((screen.getByTestId('sidebar-logout') as HTMLButtonElement).disabled).toBe(false);
   });

   it('fica em loading enquanto o logout não termina', async () => {
      // Arrange
      let finish: () => void = () => undefined;
      const { deps } = createDeps({ logout: () => new Promise<void>((resolve) => (finish = resolve)) });
      const { result } = renderHook(() => UseSidebarController(deps));

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

   it('sem e-mail o botão de sair fica desabilitado e não há inicial', () => {
      // Act
      const { result } = renderHook(() => UseSidebarController(createDeps({ email: null }).deps));

      // Assert
      expect(result.current.isLogoutDisabled).toBe(true);
      expect(result.current.avatarLetter).toBe('');
   });
});
