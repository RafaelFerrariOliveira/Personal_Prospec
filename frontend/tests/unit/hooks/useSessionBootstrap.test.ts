import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchCsrfToken } from '@axios/antiforgery/fetchCsrfToken';
import { useSessionBootstrap } from '@hooks/useSessionBootstrap';
import type { IAuthenticationService } from '@interfaces/authentication.interface';
import { markSessionBootstrapped } from '@store/reducers/session/sessionSlice';
import { clearUser, setUser } from '@store/reducers/user/userSlice';
import type { AppDispatch } from '@store/store';

vi.mock('@axios/antiforgery/fetchCsrfToken', () => ({ fetchCsrfToken: vi.fn() }));

const createService = (getSession: IAuthenticationService['getSession']): IAuthenticationService => ({
   login: vi.fn(),
   logout: vi.fn(),
   getSession,
});

const run = (service: IAuthenticationService) => {
   const dispatch = vi.fn();
   const { result } = renderHook(() => useSessionBootstrap(service, dispatch as unknown as AppDispatch));
   return { dispatch, bootstrapSession: result.current.bootstrapSession };
};

describe('useSessionBootstrap', () => {
   beforeEach(() => {
      vi.mocked(fetchCsrfToken).mockReset().mockResolvedValue(undefined);
   });

   it('busca o CSRF, depois a sessão, e despacha setUser e markSessionBootstrapped', async () => {
      // Arrange
      const getSession = vi.fn().mockResolvedValue({ email: 'a@b.com' });
      const { dispatch, bootstrapSession } = run(createService(getSession));

      // Act
      await bootstrapSession();

      // Assert
      expect(fetchCsrfToken).toHaveBeenCalledTimes(1);
      expect(getSession).toHaveBeenCalledTimes(1);
      expect(dispatch.mock.calls).toEqual([[setUser({ email: 'a@b.com' })], [markSessionBootstrapped()]]);
   });

   it('limpa o usuário quando a sessão é null', async () => {
      // Arrange
      const { dispatch, bootstrapSession } = run(createService(vi.fn().mockResolvedValue(null)));

      // Act
      await bootstrapSession();

      // Assert
      expect(dispatch.mock.calls).toEqual([[clearUser()], [markSessionBootstrapped()]]);
   });

   it('em falha do CSRF rejeita, limpa o usuário, marca a sessão e não busca a sessão', async () => {
      // Arrange
      vi.mocked(fetchCsrfToken).mockRejectedValue(new Error('rede'));
      const getSession = vi.fn();
      const { dispatch, bootstrapSession } = run(createService(getSession));

      // Act
      const result = bootstrapSession();

      // Assert
      await expect(result).rejects.toThrow('rede');
      expect(getSession).not.toHaveBeenCalled();
      expect(dispatch.mock.calls).toEqual([[clearUser()], [markSessionBootstrapped()]]);
   });

   it('em falha da sessão rejeita sem repetir chamadas', async () => {
      // Arrange
      const getSession = vi.fn().mockRejectedValue(new Error('500'));
      const { dispatch, bootstrapSession } = run(createService(getSession));

      // Act
      const result = bootstrapSession();

      // Assert
      await expect(result).rejects.toThrow('500');
      expect(fetchCsrfToken).toHaveBeenCalledTimes(1);
      expect(getSession).toHaveBeenCalledTimes(1);
      expect(dispatch.mock.calls).toEqual([[clearUser()], [markSessionBootstrapped()]]);
   });
});
