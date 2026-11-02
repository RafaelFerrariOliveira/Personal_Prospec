import type { TAxiosMiddleware } from '@axios/axios.builder';
import { selectCsrfToken } from '@store/reducers/session/sessionSlice';
import store from '@store/store';

export const CSRF_HEADER = 'X-CSRF-TOKEN';
const WRITE_METHODS = ['post', 'put', 'delete', 'patch'];

export const csrfHandlerMiddleware: TAxiosMiddleware = (instance) => {
   instance.interceptors.request.use((config) => {
      const token = selectCsrfToken(store.getState());
      if (token && WRITE_METHODS.includes((config.method ?? '').toLowerCase())) {
         config.headers.set(CSRF_HEADER, token);
      }
      return config;
   });
};
