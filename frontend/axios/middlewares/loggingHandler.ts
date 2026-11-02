import { isAxiosError, type AxiosRequestConfig } from 'axios';
import type { TAxiosMiddleware } from '@axios/axios.builder';
import type { ILogger, TLogContext } from '@domain/contracts/i-logger';
import { ConsoleLogger } from '@infrastructure/logging/ConsoleLogger';

const defaultLogger: ILogger = new ConsoleLogger({ scope: 'http' });

// Só método, URL sem query e status: nunca payload, cookie nem header de autorização.
const toLogContext = (config: AxiosRequestConfig | undefined, status: number | undefined): TLogContext => ({
   method: (config?.method ?? '').toUpperCase(),
   url: (config?.url ?? '').split('?')[0],
   ...(status === undefined ? {} : { status }),
});

export const createLoggingHandler =
   (logger: ILogger): TAxiosMiddleware =>
   (instance) => {
      instance.interceptors.response.use(
         (response) => {
            logger.debug('HTTP response', toLogContext(response.config, response.status));
            return response;
         },
         (error: unknown) => {
            if (isAxiosError(error)) {
               logger.warn('HTTP error', toLogContext(error.config, error.response?.status));
            }
            return Promise.reject(error);
         },
      );
   };

export const loggingHandler: TAxiosMiddleware = createLoggingHandler(defaultLogger);
