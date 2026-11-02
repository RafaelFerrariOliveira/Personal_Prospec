import { z } from 'zod';

export const ZLoginRequestSchema = z.object({
   email: z.string().trim().min(1, 'Informe o e-mail.').toLowerCase().pipe(z.email('Informe um e-mail válido.')),
   password: z.string().min(1, 'Informe a senha.'),
});

export type TLoginRequest = z.infer<typeof ZLoginRequestSchema>;
