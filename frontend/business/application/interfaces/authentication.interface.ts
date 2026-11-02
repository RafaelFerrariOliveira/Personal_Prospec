import type { TLoginRequest } from '@request/login.request';
import type { TSessionResponse } from '@response/session.response';

export interface IAuthenticationService {
   login(request: TLoginRequest, options?: { signal?: AbortSignal }): Promise<void>;
   logout(options?: { signal?: AbortSignal }): Promise<void>;
   getSession(options?: { signal?: AbortSignal }): Promise<TSessionResponse | null>;
}
