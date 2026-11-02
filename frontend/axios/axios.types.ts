import 'axios';

declare module 'axios' {
   interface AxiosRequestConfig {
      /** Em 401 não limpa a sessão (ex.: chamada de refresh). */
      _skipAuthRedirect?: boolean;
      /** Marca a requisição já reexecutada após refresh, evitando laço. */
      _isRetryAfterRefresh?: boolean;
   }
}
