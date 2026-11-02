import { z } from 'zod';
import { ZGuid } from '@application/validation/apiResponseSchemas';

export const ZCampaignIdRequestSchema = z.object({ id: ZGuid });

export type TCampaignIdRequest = z.infer<typeof ZCampaignIdRequestSchema>;
