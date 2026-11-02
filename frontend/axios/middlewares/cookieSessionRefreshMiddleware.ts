import { isAxiosError } from 'axios';
import { isAuthenticationPath, REFRESH_TOKEN_PATH } from '@axios/authentication.paths';
import type { TAxiosMiddleware } from '@axios/axios.builder';

export const cookieSessionRefreshMiddleware: TAxiosMiddleware = (instance) => {
   // Refresh concorrente compartilhado: N 401 simultâneos geram uma única chamada.
   let refreshInFlight: Promise<void> | null = null;

   const callRefresh = async (): Promise<void> => {
      try {
         await instance.post(REFRESH_TOKEN_PATH, undefined, { _skipAuthRedirect: true });
      } finally {
         refreshInFlight = null;
      }
   };

   const refreshSession = (): Promise<void> => {
      refreshInFlight ??= callRefresh();
      return refreshInFlight;
   };

   instance.interceptors.response.use(undefined, async (error: unknown) => {
      if (
         !isAxiosError(error) ||
         error.response?.status !== 401 ||
         !error.config ||
         error.config._isRetryAfterRefresh ||
         isAuthenticationPath(error.config.url)
      ) {
         throw error;
      }

      try {
         await refreshSession();
      } catch {
         // Refresh falhou: o 401 original segue para o sessionHandlerMiddleware.
         throw error;
      }

      return instance.request({ ...error.config, _isRetryAfterRefresh: true });
   });
};
