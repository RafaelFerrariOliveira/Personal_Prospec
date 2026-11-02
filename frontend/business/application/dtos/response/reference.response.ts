import { z } from 'zod';
import { createPaginatedResponseSchema, type TPaginatedResponse } from '@application/validation/apiResponseSchemas';

export const ZStateResponseSchema = z.object({ code: z.string(), name: z.string() });
export const ZMunicipalityResponseSchema = z.object({ code: z.string(), name: z.string() });
export const ZCnaeResponseSchema = z.object({ code: z.string(), description: z.string() });

export const ZStateListResponseSchema = z.array(ZStateResponseSchema);
export const ZCnaeListResponseSchema = z.array(ZCnaeResponseSchema);
export const ZMunicipalityPageResponseSchema = createPaginatedResponseSchema(ZMunicipalityResponseSchema);

export type TStateResponse = z.infer<typeof ZStateResponseSchema>;
export type TMunicipalityResponse = z.infer<typeof ZMunicipalityResponseSchema>;
export type TCnaeResponse = z.infer<typeof ZCnaeResponseSchema>;
export type TMunicipalityPageResponse = TPaginatedResponse<TMunicipalityResponse>;
