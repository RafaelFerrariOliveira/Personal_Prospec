import { z } from 'zod';
import {
   createPaginatedResponseSchema,
   ZGuid,
   type TPaginatedResponse,
} from '@application/validation/apiResponseSchemas';
import { ECampaignStatus } from '@enums/campaignStatus.enum';

export const ZCampaignListItemSchema = z.object({
   id: ZGuid,
   name: z.string(),
   segment: z.string(),
   locationSummary: z.string(),
   status: z.enum(ECampaignStatus),
   createdAt: z.string(),
});

export const ZCampaignListResponseSchema = createPaginatedResponseSchema(ZCampaignListItemSchema);

export type TCampaignListItem = z.infer<typeof ZCampaignListItemSchema>;
export type TCampaignListResponse = TPaginatedResponse<TCampaignListItem>;
