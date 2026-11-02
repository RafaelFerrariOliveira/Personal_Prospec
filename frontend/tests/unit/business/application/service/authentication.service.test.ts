import { AxiosError, type AxiosResponse } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { http } from '@axios/axios.instance';
import { AuthenticationService } from '@application/service/authentication.service';

const response = (data: unknown): AxiosResponse => ({
   data,
   status: 200,
   statusText: '',
   headers: {},
   config: {} as AxiosResponse['config'],
});

const httpError = (status: number): AxiosError =>
   new AxiosError('falha', String(status), undefined, null, { ...response(null), status });

describe('AuthenticationService', () => {
   afterEach(() => {
      vi.restoreAllMocks();
   });

   it('login envia credenciais para generate_access_token com _skipAuthRedirect', async () => {
      // Arrange
      const post = vi.spyOn(http, 'post').mockResolvedValue(response(true));

      // Act
      await new AuthenticationService().login({ email: 'a@b.com', password: 'x' });

      // Assert
      expect(post).toHaveBeenCalledWith(
         'Authentication/generate_access_token',
         { email: 'a@b.com', password: 'x' },
         { _skipAuthRedirect: true },
      );
   });

   it('login rejeita quando a API recusa', async () => {
      // Arrange
      vi.spyOn(http, 'post').mockRejectedValue(httpError(400));

      // Act
      const result = new AuthenticationService().login({ email: 'a@b.com', password: 'x' });

      // Assert
      await expect(result).rejects.toBeInstanceOf(AxiosError);
   });

   it('login repassa o signal', async () => {
      // Arrange
      const post = vi.spyOn(http, 'post').mockResolvedValue(response(true));
      const { signal } = new AbortController();

      // Act
      await new AuthenticationService().login({ email: 'a@b.com', password: 'x' }, { signal });

      // Assert
      expect(post.mock.calls[0]?.[2]).toMatchObject({ signal });
   });

   it('logout chama Authentication/logout', async () => {
      // Arrange
      const post = vi.spyOn(http, 'post').mockResolvedValue(response(true));

      // Act
      await new AuthenticationService().logout();

      // Assert
      expect(post).toHaveBeenCalledWith('Authentication/logout', undefined, {});
   });

   it('logout rejeita em erro', async () => {
      // Arrange
      vi.spyOn(http, 'post').mockRejectedValue(httpError(500));

      // Act
      const result = new AuthenticationService().logout();

      // Assert
      await expect(result).rejects.toBeInstanceOf(AxiosError);
   });

   it('getSession devolve a sessão validada e usa _skipAuthRedirect', async () => {
      // Arrange
      const get = vi.spyOn(http, 'get').mockResolvedValue(response({ email: 'a@b.com' }));

      // Act
      const session = await new AuthenticationService().getSession();

      // Assert
      expect(session).toEqual({ email: 'a@b.com' });
      expect(get).toHaveBeenCalledWith('Authentication/get_session', { _skipAuthRedirect: true });
   });

   it('getSession devolve null quando a API responde null', async () => {
      // Arrange
      vi.spyOn(http, 'get').mockResolvedValue(response(null));

      // Act
      const session = await new AuthenticationService().getSession();

      // Assert
      expect(session).toBeNull();
   });

   it('getSession devolve null quando o corpo não passa no Zod', async () => {
      // Arrange
      vi.spyOn(http, 'get').mockResolvedValue(response({ email: 42 }));

      // Act
      const session = await new AuthenticationService().getSession();

      // Assert
      expect(session).toBeNull();
   });

   it('getSession devolve null em 401', async () => {
      // Arrange
      vi.spyOn(http, 'get').mockRejectedValue(httpError(401));

      // Act
      const session = await new AuthenticationService().getSession();

      // Assert
      expect(session).toBeNull();
   });

   it('getSession rejeita em erro diferente de 401', async () => {
      // Arrange
      vi.spyOn(http, 'get').mockRejectedValue(httpError(500));

      // Act
      const result = new AuthenticationService().getSession();

      // Assert
      await expect(result).rejects.toBeInstanceOf(AxiosError);
   });

   it('getSession repassa o signal', async () => {
      // Arrange
      const get = vi.spyOn(http, 'get').mockResolvedValue(response(null));
      const { signal } = new AbortController();

      // Act
      await new AuthenticationService().getSession({ signal });

      // Assert
      expect(get.mock.calls[0]?.[1]).toMatchObject({ signal, _skipAuthRedirect: true });
   });
});
