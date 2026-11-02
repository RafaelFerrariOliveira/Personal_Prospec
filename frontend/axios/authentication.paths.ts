import { ApiControllers } from '@api/api.controllers';

export const GENERATE_ACCESS_TOKEN_PATH = `${ApiControllers.Authentication}/generate_access_token`;
export const REFRESH_TOKEN_PATH = `${ApiControllers.Authentication}/refresh_token`;

const NO_REFRESH_PATHS = [GENERATE_ACCESS_TOKEN_PATH, REFRESH_TOKEN_PATH];

/**
 * Rotas que nunca disparam refresh (login e o próprio refresh). get_session e logout podem renovar:
 * sem isso, o access token expirado no bootstrap mandaria o usuário ao login mesmo com refresh válido.
 */
export const isAuthenticationPath = (url: string | undefined): boolean =>
   NO_REFRESH_PATHS.includes((url ?? '').replace(/^\/+/, ''));
