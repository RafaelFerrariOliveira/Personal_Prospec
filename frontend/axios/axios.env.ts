const LOCAL_DEVELOPMENT_API_BASE_URL = '/api';

function resolveApiBaseUrl(): string {
   const urlFromEnv = import.meta.env.VITE_API_URL;

   if (import.meta.env.DEV) return urlFromEnv?.length ? urlFromEnv : LOCAL_DEVELOPMENT_API_BASE_URL;

   if (urlFromEnv?.length) return urlFromEnv;
   throw new Error('[axios.env] VITE_API_URL não definida. Defina a variável para o build de produção.');
}

export const baseUrl = resolveApiBaseUrl();
