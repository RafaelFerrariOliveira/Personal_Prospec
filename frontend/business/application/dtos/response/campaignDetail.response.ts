import { z } from 'zod';
import { ZGuid } from '@application/validation/apiResponseSchemas';
import { ECampaignStatus } from '@enums/campaignStatus.enum';

export const ZCampaignProgressSchema = z.object({
   found: z.number(),
   qualified: z.number(),
   pending: z.number(),
   target: z.number(),
});

export const ZCampaignDetailResponseSchema = z.object({
   id: ZGuid,
   name: z.string(),
   objective: z.string(),
   idealProfile: z.string().nullish(),
   segment: z.string(),
   services: z.string().nullish(),
   differentials: z.string().nullish(),
   valueProposition: z.string().nullish(),
   targetLeadCount: z.number().int(),
   locations: z.array(z.object({ state: z.string(), municipalityCode: z.string(), municipalityName: z.string() })),
   cnaes: z.array(z.object({ code: z.string(), description: z.string() })),
   status: z.enum(ECampaignStatus),
   createdAt: z.string(),
   updatedAt: z.string(),
   progress: ZCampaignProgressSchema.nullish(),
});

export type TCampaignDetailResponse = z.infer<typeof ZCampaignDetailResponseSchema>;
