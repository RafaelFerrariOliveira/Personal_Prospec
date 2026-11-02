import axios, {
   AxiosError,
   type AxiosAdapter,
   type AxiosInstance,
   type AxiosResponse,
   type InternalAxiosRequestConfig,
} from 'axios';
import type { TAxiosMiddleware } from '@axios/axios.builder';

export type TStubReply = { status: number; data?: unknown };
export type TStubHandler = (config: InternalAxiosRequestConfig) => TStubReply | Promise<TStubReply>;

/** Fronteira de rede falsa: o axios e os interceptors reais rodam, só o adapter responde. */
export const createStubAdapter = (handler: TStubHandler): AxiosAdapter => {
   return async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
      const { status, data } = await handler(config);
      const response: AxiosResponse = { data, status, statusText: '', headers: {}, config };
      if (status >= 200 && status < 300) return response;
      throw new AxiosError(`status ${status}`, String(status), config, null, response);
   };
};

export const createTestInstance = (handler: TStubHandler, middlewares: TAxiosMiddleware[]): AxiosInstance => {
   const instance = axios.create({ baseURL: '/api', adapter: createStubAdapter(handler) });
   middlewares.forEach((middleware) => middleware(instance));
   return instance;
};
