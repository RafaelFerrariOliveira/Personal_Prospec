import { isAxiosError } from 'axios';
import { GENERATE_ACCESS_TOKEN_PATH } from '@axios/authentication.paths';
import type { TAxiosMiddleware } from '@axios/axios.builder';
import { clearSession, markSessionBootstrapped } from '@store/reducers/session/sessionSlice';
import { clearUser } from '@store/reducers/user/userSlice';
import store from '@store/store';

export const sessionHandlerMiddleware: TAxiosMiddleware = (instance) => {
   instance.interceptors.response.use(
      (response) => {
         if (response.config.url === GENERATE_ACCESS_TOKEN_PATH) {
            store.dispatch(markSessionBootstrapped());
         }
         return response;
      },
      (error: unknown) => {
         if (isAxiosError(error) && error.response?.status === 401 && !error.config?._skipAuthRedirect) {
            store.dispatch(clearSession());
            store.dispatch(clearUser());
         }
         return Promise.reject(error);
      },
   );
};
