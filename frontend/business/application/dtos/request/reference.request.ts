import { z } from 'zod';

export const ZMunicipalitiesQuerySchema = z.object({
   state: z.string().length(2),
   search: z.string().optional(),
   pageNumber: z.number().int().positive(),
   pageSize: z.number().int().positive(),
});

export type TMunicipalitiesQuery = z.infer<typeof ZMunicipalitiesQuerySchema>;
