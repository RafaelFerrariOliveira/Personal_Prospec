import { describe, expect, it } from 'vitest';
import {
   ZCampaignHistoryRequestSchema,
   ZCampaignListRequestSchema,
   ZUpdateCampaignRequestSchema,
} from '@request/campaign.request';
import { ZCampaignIdRequestSchema } from '@request/campaignId.request';

const ID = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';

const update = {
   id: ID,
   name: 'Campanha',
   objective: 'Objetivo',
   idealProfile: '',
   segment: 'Segmento',
   services: '',
   differentials: '',
   valueProposition: '',
   targetLeadCount: 10,
   locations: [{ state: 'SP', municipalityCode: '7107' }],
   cnaeCodes: ['6201501'],
};

describe('ZUpdateCampaignRequestSchema', () => {
   it('aceita os campos com o id da campanha, sem requestId', () => {
      // Act
      const result = ZUpdateCampaignRequestSchema.safeParse(update);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).not.toHaveProperty('requestId');
   });

   it('recusa id inválido, nome só com espaços e lista de CNAE vazia', () => {
      // Act
      const badId = ZUpdateCampaignRequestSchema.safeParse({ ...update, id: 'abc' });
      const blankName = ZUpdateCampaignRequestSchema.safeParse({ ...update, name: '  ' });
      const noCnae = ZUpdateCampaignRequestSchema.safeParse({ ...update, cnaeCodes: [] });

      // Assert
      expect(badId.success).toBe(false);
      expect(blankName.success).toBe(false);
      expect(noCnae.success).toBe(false);
   });
});

describe('ZCampaignIdRequestSchema', () => {
   it('aceita Guid e recusa texto livre', () => {
      // Act
      const valid = ZCampaignIdRequestSchema.safeParse({ id: ID });
      const invalid = ZCampaignIdRequestSchema.safeParse({ id: 'x' });

      // Assert
      expect(valid.success).toBe(true);
      expect(invalid.success).toBe(false);
   });
});

describe('ZCampaignListRequestSchema e ZCampaignHistoryRequestSchema', () => {
   it('lista aceita estado conhecido e recusa estado desconhecido, página 0 e pageSize acima de 30', () => {
      // Act
      const valid = ZCampaignListRequestSchema.safeParse({ status: 'Paused', pageNumber: 1, pageSize: 30 });
      const unknownStatus = ZCampaignListRequestSchema.safeParse({ status: 'Outro', pageNumber: 1, pageSize: 20 });
      const pageZero = ZCampaignListRequestSchema.safeParse({ pageNumber: 0, pageSize: 20 });
      const tooBig = ZCampaignListRequestSchema.safeParse({ pageNumber: 1, pageSize: 31 });

      // Assert
      expect(valid.success).toBe(true);
      expect(unknownStatus.success).toBe(false);
      expect(pageZero.success).toBe(false);
      expect(tooBig.success).toBe(false);
   });

   it('histórico exige id Guid e página positiva', () => {
      // Act
      const valid = ZCampaignHistoryRequestSchema.safeParse({ id: ID, pageNumber: 1, pageSize: 20 });
      const invalid = ZCampaignHistoryRequestSchema.safeParse({ id: 'x', pageNumber: 1, pageSize: 20 });

      // Assert
      expect(valid.success).toBe(true);
      expect(invalid.success).toBe(false);
   });
});
