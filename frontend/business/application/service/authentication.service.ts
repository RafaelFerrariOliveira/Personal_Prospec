import { isAxiosError } from 'axios';
import { injectable } from 'inversify';
import { ApiControllers } from '@api/api.controllers';
import type { IAuthenticationService } from '@interfaces/authentication.interface';
import type { TLoginRequest } from '@request/login.request';
import { ZSessionResponseSchema, type TSessionResponse } from '@response/session.response';
import { BaseService } from './Base.service';

type TCallOptions = { signal?: AbortSignal };

const toRequestConfig = (options?: TCallOptions): { signal?: AbortSignal; _skipAuthRedirect: true } => ({
   _skipAuthRedirect: true,
   ...(options?.signal ? { signal: options.signal } : {}),
});

const ZNullableSessionSchema = ZSessionResponseSchema.nullable();

@injectable()
export class AuthenticationService extends BaseService implements IAuthenticationService {
   public login = async (request: TLoginRequest, options?: TCallOptions): Promise<void> => {
      await this.execute(
         'login',
         async () => {
            await this.http.post(
               this.buildPath(ApiControllers.Authentication, 'generate_access_token'),
               request,
               toRequestConfig(options),
            );
         },
         { rethrow: true },
      );
   };

   public logout = async (options?: TCallOptions): Promise<void> => {
      await this.execute(
         'logout',
         async () => {
            await this.http.post(
               this.buildPath(ApiControllers.Authentication, 'logout'),
               undefined,
               options?.signal ? { signal: options.signal } : {},
            );
         },
         { rethrow: true },
      );
   };

   public getSession = async (options?: TCallOptions): Promise<TSessionResponse | null> => {
      return this.execute(
         'getSession',
         async () => {
            try {
               const response = await this.http.get(
                  this.buildPath(ApiControllers.Authentication, 'get_session'),
                  toRequestConfig(options),
               );
               return this.validateResponse(
                  ZNullableSessionSchema,
                  response.data,
                  null,
                  'AuthenticationService.getSession',
               );
            } catch (error: unknown) {
               // 401 aqui é "sem sessão", não falha: o bootstrap decide ir ao login.
               if (isAxiosError(error) && error.response?.status === 401) return null;
               throw error;
            }
         },
         { rethrow: true },
      );
   };
}
