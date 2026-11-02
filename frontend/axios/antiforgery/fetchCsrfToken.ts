import { z } from 'zod';
import { ApiControllers } from '@api/api.controllers';
import { http } from '@axios/axios.instance';
import { setCsrfToken } from '@store/reducers/session/sessionSlice';
import store from '@store/store';

// Corpo { token }: o endpoint ainda não existe no backend, ajustar aqui se o contrato mudar.
const ZCsrfTokenResponseSchema = z.object({ token: z.string().min(1) });

/** Usada só no bootstrap de sessão: busca o token e guarda na store. */
export const fetchCsrfToken = async (): Promise<void> => {
   const response = await http.get(`${ApiControllers.Antiforgery}/token`);
   const { token } = ZCsrfTokenResponseSchema.parse(response.data);
   store.dispatch(setCsrfToken(token));
};
