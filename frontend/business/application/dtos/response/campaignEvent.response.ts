import { z } from 'zod';
import { createPaginatedResponseSchema, type TPaginatedResponse } from '@application/validation/apiResponseSchemas';

export const ZCampaignEventSchema = z.object({
   type: z.string(),
   description: z.string(),
   occurredAt: z.string(),
});

export const ZCampaignEventListResponseSchema = createPaginatedResponseSchema(ZCampaignEventSchema);

export type TCampaignEvent = z.infer<typeof ZCampaignEventSchema>;
export type TCampaignEventListResponse = TPaginatedResponse<TCampaignEvent>;
