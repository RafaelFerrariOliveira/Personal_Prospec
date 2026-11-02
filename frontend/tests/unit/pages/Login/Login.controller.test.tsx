import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { NavigateFunction } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchCsrfToken } from '@axios/antiforgery/fetchCsrfToken';
import { ApiError } from '@domain/errors/api-error';
import type { IAuthenticationService } from '@interfaces/authentication.interface';
import UseLoginController from '@pages/Login/Login.controller';
import LoginView from '@pages/Login/Login.view';
import { RoutePaths } from '@routes/routePaths';
import { setUser } from '@store/reducers/user/userSlice';
import type { AppDispatch } from '@store/store';

vi.mock('@axios/antiforgery/fetchCsrfToken', () => ({ fetchCsrfToken: vi.fn() }));

type TFakes = {
   service: { login: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn>; getSession: ReturnType<typeof vi.fn> };
   navigate: ReturnType<typeof vi.fn>;
   dispatch: ReturnType<typeof vi.fn>;
};

// Harness: controller real + view real; só o Service e o fetchCsrfToken (fronteira) são falsos.
const Harness = ({ fakes }: { fakes: TFakes }) => {
   const controller = UseLoginController({
      authenticationService: fakes.service as unknown as IAuthenticationService,
      navigate: fakes.navigate as unknown as NavigateFunction,
      dispatch: fakes.dispatch as unknown as AppDispatch,
   });
   return <LoginView {...controller} />;
};

const createFakes = (): TFakes => ({
   service: {
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ email: 'a@b.com' }),
   },
   navigate: vi.fn(),
   dispatch: vi.fn(),
});

const fillAndSubmit = (email: string, password: string): void => {
   fireEvent.change(screen.getByTestId('login-email'), { target: { value: email } });
   fireEvent.change(screen.getByTestId('login-password'), { target: { value: password } });
   fireEvent.submit(screen.getByTestId('login-form'));
};

describe('UseLoginController', () => {
   beforeEach(() => {
      vi.mocked(fetchCsrfToken).mockReset().mockResolvedValue(undefined);
   });

   it('login com sucesso refaz o bootstrap, guarda o usuário e navega para a Home', async () => {
      // Arrange
      const fakes = createFakes();
      render(<Harness fakes={fakes} />);

      // Act
      fillAndSubmit('  A@B.com ', 'senha');

      // Assert
      await waitFor(() => expect(fakes.navigate).toHaveBeenCalledWith(RoutePaths.home));
      expect(fakes.service.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'senha' });
      expect(fetchCsrfToken).toHaveBeenCalledTimes(1);
      expect(fakes.dispatch).toHaveBeenCalledWith(setUser({ email: 'a@b.com' }));
   });

   it('erro 400 mostra as mensagens da API e não navega', async () => {
      // Arrange
      const fakes = createFakes();
      fakes.service.login.mockRejectedValue(new ApiError(['E-mail ou senha inválidos.'], 400));
      render(<Harness fakes={fakes} />);

      // Act
      fillAndSubmit('a@b.com', 'errada');

      // Assert
      expect(await screen.findByText('E-mail ou senha inválidos.')).toBeTruthy();
      expect(fakes.navigate).not.toHaveBeenCalled();
   });

   it('erro 500 mostra mensagem genérica e libera o botão', async () => {
      // Arrange
      const fakes = createFakes();
      fakes.service.login.mockRejectedValue(Object.assign(new Error('500'), { response: { status: 500 } }));
      render(<Harness fakes={fakes} />);

      // Act
      fillAndSubmit('a@b.com', 'senha');

      // Assert
      const errors = await screen.findByTestId('login-submit-errors');
      expect(errors.textContent).toBe('Não foi possível entrar. Tente novamente em instantes.');
      await waitFor(() => expect((screen.getByTestId('login-submit') as HTMLButtonElement).disabled).toBe(false));
   });

   it('erro de rede mostra mensagem genérica', async () => {
      // Arrange
      const fakes = createFakes();
      fakes.service.login.mockRejectedValue(new Error('Network Error'));
      render(<Harness fakes={fakes} />);

      // Act
      fillAndSubmit('a@b.com', 'senha');

      // Assert
      const errors = await screen.findByTestId('login-submit-errors');
      expect(errors.textContent).toBe('Não foi possível entrar. Tente novamente em instantes.');
   });

   it('falha no bootstrap após o login mostra mensagem genérica e não navega', async () => {
      // Arrange
      const fakes = createFakes();
      vi.mocked(fetchCsrfToken).mockRejectedValue(new Error('rede'));
      render(<Harness fakes={fakes} />);

      // Act
      fillAndSubmit('a@b.com', 'senha');

      // Assert
      expect(await screen.findByTestId('login-submit-errors')).toBeTruthy();
      expect(fakes.navigate).not.toHaveBeenCalled();
   });

   it('duplo envio chama login uma vez', async () => {
      // Arrange
      const fakes = createFakes();
      let finishLogin: () => void = () => undefined;
      fakes.service.login.mockReturnValue(new Promise<void>((resolve) => (finishLogin = resolve)));
      render(<Harness fakes={fakes} />);

      // Act
      fillAndSubmit('a@b.com', 'senha');
      fireEvent.submit(screen.getByTestId('login-form'));
      fireEvent.submit(screen.getByTestId('login-form'));
      finishLogin();

      // Assert
      await waitFor(() => expect(fakes.navigate).toHaveBeenCalledTimes(1));
      expect(fakes.service.login).toHaveBeenCalledTimes(1);
   });

   it('campos inválidos mostram erro do schema e não chamam login', async () => {
      // Arrange
      const fakes = createFakes();
      render(<Harness fakes={fakes} />);

      // Act
      fillAndSubmit('', '');

      // Assert
      expect((await screen.findByTestId('login-email-error')).textContent).toBe('Informe o e-mail.');
      expect(screen.getByTestId('login-password-error').textContent).toBe('Informe a senha.');
      expect(fakes.service.login).not.toHaveBeenCalled();
   });
});
