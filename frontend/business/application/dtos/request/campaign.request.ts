import { z } from 'zod';
import { ZGuid } from '@application/validation/apiResponseSchemas';
import { CAMPAIGN_LIMITS } from '@domain/campaignLimits';
import { ECampaignStatus } from '@enums/campaignStatus.enum';

const requiredText = (label: string, maxLength: number) =>
   z.string().trim().min(1, `Informe ${label}.`).max(maxLength, `Use no máximo ${maxLength} caracteres.`);

const optionalText = (maxLength: number) => z.string().trim().max(maxLength, `Use no máximo ${maxLength} caracteres.`);

const LEAD_COUNT_RANGE_MESSAGE = `A quantidade deve ficar entre ${CAMPAIGN_LIMITS.minTargetLeadCount} e ${CAMPAIGN_LIMITS.maxTargetLeadCount}.`;

export const ZCampaignLocationSchema = z.object({
   state: z.string().length(2, 'Escolha a UF.'),
   municipalityCode: z.string().regex(/^\d{4}$/, 'Código de município inválido.'),
});

export type TCampaignLocation = z.infer<typeof ZCampaignLocationSchema>;

const hasNoDuplicates = (values: string[]): boolean => new Set(values).size === values.length;

export const ZCreateCampaignRequestSchema = z.object({
   requestId: ZGuid,
   name: requiredText('o nome da campanha', CAMPAIGN_LIMITS.nameMaxLength),
   objective: requiredText('o objetivo da campanha', CAMPAIGN_LIMITS.objectiveMaxLength),
   idealProfile: optionalText(CAMPAIGN_LIMITS.longTextMaxLength),
   segment: requiredText('o segmento', CAMPAIGN_LIMITS.segmentMaxLength),
   services: optionalText(CAMPAIGN_LIMITS.longTextMaxLength),
   differentials: optionalText(CAMPAIGN_LIMITS.longTextMaxLength),
   valueProposition: optionalText(CAMPAIGN_LIMITS.longTextMaxLength),
   targetLeadCount: z
      .number({ error: 'Informe a quantidade de leads.' })
      .int('Informe um número inteiro.')
      .min(CAMPAIGN_LIMITS.minTargetLeadCount, LEAD_COUNT_RANGE_MESSAGE)
      .max(CAMPAIGN_LIMITS.maxTargetLeadCount, LEAD_COUNT_RANGE_MESSAGE),
   locations: z
      .array(ZCampaignLocationSchema)
      .min(CAMPAIGN_LIMITS.minCities, 'Escolha ao menos uma cidade.')
      .max(CAMPAIGN_LIMITS.maxCities, `Escolha no máximo ${CAMPAIGN_LIMITS.maxCities} cidades.`)
      .refine((items) => new Set(items.map((item) => item.state)).size <= 1, 'Todas as cidades devem ser da mesma UF.')
      .refine((items) => hasNoDuplicates(items.map((item) => item.municipalityCode)), 'Há cidade repetida.'),
   cnaeCodes: z
      .array(z.string().regex(new RegExp(`^\\d{${CAMPAIGN_LIMITS.cnaeCodeLength}}$`), 'CNAE deve ter 7 dígitos.'))
      .min(CAMPAIGN_LIMITS.minCnae, 'Escolha ao menos um CNAE.')
      .max(CAMPAIGN_LIMITS.maxCnae, `Escolha no máximo ${CAMPAIGN_LIMITS.maxCnae} CNAE.`)
      .refine(hasNoDuplicates, 'Há CNAE repetido.'),
});

export type TCreateCampaignRequest = z.infer<typeof ZCreateCampaignRequestSchema>;

// Edição: mesmos campos da criação, com o id da campanha no lugar do requestId.
export const ZUpdateCampaignRequestSchema = ZCreateCampaignRequestSchema.omit({ requestId: true }).extend({
   id: ZGuid,
});

export type TUpdateCampaignRequest = z.infer<typeof ZUpdateCampaignRequestSchema>;

export const ZCampaignListRequestSchema = z.object({
   status: z.enum(ECampaignStatus).optional(),
   pageNumber: z.number().int().positive(),
   pageSize: z.number().int().positive().max(CAMPAIGN_LIMITS.maxPageSize),
});

export type TCampaignListRequest = z.infer<typeof ZCampaignListRequestSchema>;

export const ZCampaignHistoryRequestSchema = z.object({
   id: ZGuid,
   pageNumber: z.number().int().positive(),
   pageSize: z.number().int().positive().max(CAMPAIGN_LIMITS.maxPageSize),
});

export type TCampaignHistoryRequest = z.infer<typeof ZCampaignHistoryRequestSchema>;
