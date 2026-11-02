import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAccessControl } from '@access/hooks/useAccessControl';
import { fetchCsrfToken } from '@axios/antiforgery/fetchCsrfToken';
import type { IAuthenticationService } from '@interfaces/authentication.interface';
import AuthRequiredRoutes from '@routes/AuthRequiredRoutes';
import { RoutePaths } from '@routes/routePaths';
import { rootReducer } from '@store/combineReducers';

const getSession = vi.fn();

// Fronteiras falsas: Service injetado, CSRF, header e controle de acesso.
vi.mock('@hooks/useInjection', () => ({
   useInjection: (): IAuthenticationService => ({ login: vi.fn(), logout: vi.fn(), getSession }),
}));
vi.mock('@axios/antiforgery/fetchCsrfToken', () => ({ fetchCsrfToken: vi.fn() }));
vi.mock('@components/sidebar/Sidebar', () => ({ default: () => <div data-testid="sidebar-stub" /> }));
vi.mock('@access/hooks/useAccessControl', () => ({ useAccessControl: vi.fn() }));

const allowAll = (): void => {
   vi.mocked(useAccessControl).mockReturnValue({
      canAccessRoute: () => true,
      canShowMenuItem: () => true,
      canUseFeature: () => true,
   });
};

const renderGuard = (options: { isBootstrapped: boolean; email: string | null }) => {
   const store = configureStore({
      reducer: rootReducer,
      preloadedState: {
         session: { isSessionBootstrapped: options.isBootstrapped, csrfToken: null },
         user: { user: options.email ? { email: options.email } : null },
      },
   });
   return render(
      <Provider store={store}>
         <MemoryRouter initialEntries={['/interna']}>
            <Routes>
               <Route path={RoutePaths.login} element={<div data-testid="login-page" />} />
               <Route path={RoutePaths.home} element={<div data-testid="home-page" />} />
               <Route element={<AuthRequiredRoutes />}>
                  <Route path="/interna" element={<div data-testid="private-page" />} />
               </Route>
            </Routes>
         </MemoryRouter>
      </Provider>,
   );
};

describe('AuthRequiredRoutes', () => {
   beforeEach(() => {
      getSession.mockReset();
      vi.mocked(fetchCsrfToken).mockReset().mockResolvedValue(undefined);
      allowAll();
   });

   it('sem usuário e já inicializada, vai para o login', async () => {
      // Act
      renderGuard({ isBootstrapped: true, email: null });

      // Assert
      expect(await screen.findByTestId('login-page')).toBeTruthy();
   });

   it('com usuário renderiza o menu lateral e o Outlet', async () => {
      // Act
      renderGuard({ isBootstrapped: true, email: 'a@b.com' });

      // Assert
      expect(await screen.findByTestId('private-page')).toBeTruthy();
      expect(screen.getByTestId('sidebar-stub')).toBeTruthy();
   });

   it('mostra Loading enquanto o bootstrap não termina e não renderiza a página', () => {
      // Arrange
      getSession.mockReturnValue(new Promise(() => undefined));

      // Act
      renderGuard({ isBootstrapped: false, email: null });

      // Assert
      expect(screen.getByTestId('loading')).toBeTruthy();
      expect(screen.queryByTestId('private-page')).toBeNull();
   });

   it('após o bootstrap com sessão válida renderiza a página', async () => {
      // Arrange
      getSession.mockResolvedValue({ email: 'a@b.com' });

      // Act
      renderGuard({ isBootstrapped: false, email: null });

      // Assert
      expect(await screen.findByTestId('private-page')).toBeTruthy();
      expect(getSession).toHaveBeenCalledTimes(1);
   });

   it('após o bootstrap sem sessão vai para o login', async () => {
      // Arrange
      getSession.mockResolvedValue(null);

      // Act
      renderGuard({ isBootstrapped: false, email: null });

      // Assert
      expect(await screen.findByTestId('login-page')).toBeTruthy();
   });

   it('falha no bootstrap vai para o login sem repetir chamadas', async () => {
      // Arrange
      vi.mocked(fetchCsrfToken).mockRejectedValue(new Error('rede'));

      // Act
      renderGuard({ isBootstrapped: false, email: null });

      // Assert
      expect(await screen.findByTestId('login-page')).toBeTruthy();
      expect(fetchCsrfToken).toHaveBeenCalledTimes(1);
   });

   it('rota negada pelo controle de acesso vai para a home', async () => {
      // Arrange
      vi.mocked(useAccessControl).mockReturnValue({
         canAccessRoute: () => false,
         canShowMenuItem: () => false,
         canUseFeature: () => false,
      });

      // Act
      renderGuard({ isBootstrapped: true, email: 'a@b.com' });

      // Assert
      expect(await screen.findByTestId('home-page')).toBeTruthy();
      expect(screen.queryByTestId('private-page')).toBeNull();
   });
});
