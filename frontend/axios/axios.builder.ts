import type { AxiosInstance } from 'axios';
import axios from 'axios';

type THeaders = Record<string, string>;

export type TAxiosMiddleware = (instance: AxiosInstance) => void;

class AxiosDomain {
   private readonly baseURL: string;
   private readonly headers: THeaders;
   private readonly withCredentials: boolean;
   private readonly middlewares: TAxiosMiddleware[];

   constructor(baseURL: string, headers: THeaders, withCredentials: boolean, middlewares: TAxiosMiddleware[] = []) {
      this.baseURL = baseURL;
      this.headers = headers;
      this.withCredentials = withCredentials;
      this.middlewares = middlewares;
   }

   initInstance(): AxiosInstance {
      const instance = axios.create({
         baseURL: this.baseURL,
         headers: this.headers,
         withCredentials: this.withCredentials,
      });

      this.middlewares.forEach((middleware) => middleware(instance));

      return instance;
   }
}

export class AxiosBuilder {
   private baseURL = '';
   private headers: THeaders = {};
   private withCredentials = false;
   private readonly middlewares: TAxiosMiddleware[] = [];

   static build(): AxiosBuilder {
      return new AxiosBuilder();
   }

   toDomain(): AxiosDomain {
      return new AxiosDomain(this.baseURL, this.headers, this.withCredentials, [...this.middlewares]);
   }

   withUrl(url: string): AxiosBuilder {
      this.baseURL = url;
      return this;
   }

   withJsonContentType(): AxiosBuilder {
      this.headers = { ...this.headers, 'content-type': 'application/json' };
      return this;
   }

   withHeaders(headers: THeaders): AxiosBuilder {
      this.headers = { ...this.headers, ...headers };
      return this;
   }

   /** Envia o cookie httpOnly da sessão (withCredentials). Obrigatório para a API do backend. */
   haveCredentials(): AxiosBuilder {
      this.withCredentials = true;
      return this;
   }

   withMiddleware(middleware: TAxiosMiddleware): AxiosBuilder {
      this.middlewares.push(middleware);
      return this;
   }

   withMiddlewares(middlewares: TAxiosMiddleware[]): AxiosBuilder {
      this.middlewares.push(...middlewares);
      return this;
   }
}
