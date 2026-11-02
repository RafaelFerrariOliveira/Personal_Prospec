import { z } from 'zod';

export const ZSessionResponseSchema = z.object({
   email: z.string(),
});

export type TSessionResponse = z.infer<typeof ZSessionResponseSchema>;
