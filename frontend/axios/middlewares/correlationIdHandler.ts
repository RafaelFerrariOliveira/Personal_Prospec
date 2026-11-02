import type { TAxiosMiddleware } from '@axios/axios.builder';

export const CORRELATION_ID_HEADER = 'X-Correlation-Id';

export const correlationIdHandler: TAxiosMiddleware = (instance) => {
   instance.interceptors.request.use((config) => {
      config.headers.set(CORRELATION_ID_HEADER, crypto.randomUUID());
      return config;
   });
};
