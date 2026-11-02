import { useCallback } from 'react';
import type { AppDispatch } from '@store/store';
import { fetchCsrfToken } from '@axios/antiforgery/fetchCsrfToken';
import type { IAuthenticationService } from '@interfaces/authentication.interface';
import { markSessionBootstrapped } from '@store/reducers/session/sessionSlice';
import { clearUser, setUser } from '@store/reducers/user/userSlice';

export interface ISessionBootstrap {
   /** Busca o CSRF e a sessão. Reutilizada após o login (o token anônimo deixa de valer ao autenticar). */
   bootstrapSession: () => Promise<void>;
}

export const useSessionBootstrap = (
   authenticationService: IAuthenticationService,
   dispatch: AppDispatch,
): ISessionBootstrap => {
   const bootstrapSession = useCallback(async (): Promise<void> => {
      try {
         await fetchCsrfToken();
         const session = await authenticationService.getSession();
         dispatch(session ? setUser(session) : clearUser());
      } catch (error: unknown) {
         dispatch(clearUser());
         throw error;
      } finally {
         // Sempre marca, mesmo em falha: sem isso o guard repetiria o bootstrap em laço.
         dispatch(markSessionBootstrapped());
      }
   }, [authenticationService, dispatch]);

   return { bootstrapSession };
};
