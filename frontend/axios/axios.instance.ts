import { AxiosBuilder } from './axios.builder';
import { baseUrl } from './axios.env';
import { cookieSessionRefreshMiddleware } from './middlewares/cookieSessionRefreshMiddleware';
import { correlationIdHandler } from './middlewares/correlationIdHandler';
import { csrfHandlerMiddleware } from './middlewares/csrfHandlerMiddleware';
import { loggingHandler } from './middlewares/loggingHandler';
import { messageHandlerMiddlware } from './middlewares/messageHandlerMiddlware';
import { sessionHandlerMiddleware } from './middlewares/sessionHandlerMiddleware';

/** Instância HTTP única do app (ver api-integration.md): nenhum Service cria instância própria. */
export const http = AxiosBuilder.build()
   .withUrl(baseUrl)
   .withJsonContentType()
   .haveCredentials()
   .withMiddlewares([
      correlationIdHandler,
      loggingHandler,
      csrfHandlerMiddleware,
      cookieSessionRefreshMiddleware,
      messageHandlerMiddlware,
      sessionHandlerMiddleware,
   ])
   .toDomain()
   .initInstance();
