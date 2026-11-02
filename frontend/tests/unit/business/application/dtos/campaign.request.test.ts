import { describe, expect, it } from 'vitest';
import { CAMPAIGN_LIMITS } from '@domain/campaignLimits';
import { ZCreateCampaignRequestSchema, type TCreateCampaignRequest } from '@request/campaign.request';

const validRequest = (): TCreateCampaignRequest => ({
   requestId: '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b',
   name: 'Campanha de teste',
   objective: 'Prospectar clientes',
   idealProfile: '',
   segment: 'Tecnologia',
   services: '',
   differentials: '',
   valueProposition: '',
   targetLeadCount: 50,
   locations: [{ state: 'SP', municipalityCode: '7107' }],
   cnaeCodes: ['6201501'],
});

const firstMessage = (request: unknown): string | undefined =>
   ZCreateCampaignRequestSchema.safeParse(request).error?.issues[0]?.message;

describe('ZCreateCampaignRequestSchema', () => {
   it('aceita a campanha válida e aplica trim nos textos', () => {
      // Act
      const result = ZCreateCampaignRequestSchema.parse({ ...validRequest(), name: '  Campanha  ' });

      // Assert
      expect(result.name).toBe('Campanha');
   });

   it.each([
      ['name', CAMPAIGN_LIMITS.nameMaxLength],
      ['objective', CAMPAIGN_LIMITS.objectiveMaxLength],
      ['segment', CAMPAIGN_LIMITS.segmentMaxLength],
      ['idealProfile', CAMPAIGN_LIMITS.longTextMaxLength],
      ['services', CAMPAIGN_LIMITS.longTextMaxLength],
      ['differentials', CAMPAIGN_LIMITS.longTextMaxLength],
      ['valueProposition', CAMPAIGN_LIMITS.longTextMaxLength],
   ])('campo %s aceita o tamanho máximo e recusa um caractere a mais', (field, max) => {
      // Act
      const atLimit = ZCreateCampaignRequestSchema.safeParse({ ...validRequest(), [field]: 'a'.repeat(max) });
      const overLimit = ZCreateCampaignRequestSchema.safeParse({ ...validRequest(), [field]: 'a'.repeat(max + 1) });

      // Assert
      expect(atLimit.success).toBe(true);
      expect(overLimit.error?.issues[0]?.message).toBe(`Use no máximo ${max} caracteres.`);
   });

   it.each(['name', 'objective', 'segment'])('campo obrigatório %s recusa vazio e só espaços', (field) => {
      // Act
      const empty = firstMessage({ ...validRequest(), [field]: '' });
      const blank = firstMessage({ ...validRequest(), [field]: '   ' });

      // Assert
      expect(empty).toMatch(/^Informe /);
      expect(blank).toBe(empty);
   });

   it('campos opcionais aceitam vazio', () => {
      // Act
      const result = ZCreateCampaignRequestSchema.safeParse(validRequest());

      // Assert
      expect(result.success).toBe(true);
   });

   it.each([0, -1, CAMPAIGN_LIMITS.maxTargetLeadCount + 1])('recusa quantidade de leads %s', (value) => {
      // Act
      const message = firstMessage({ ...validRequest(), targetLeadCount: value });

      // Assert
      expect(message).toBe('A quantidade deve ficar entre 1 e 500.');
   });

   it.each([1, CAMPAIGN_LIMITS.maxTargetLeadCount])('aceita quantidade de leads %s', (value) => {
      // Act
      const result = ZCreateCampaignRequestSchema.safeParse({ ...validRequest(), targetLeadCount: value });

      // Assert
      expect(result.success).toBe(true);
   });

   it('recusa quantidade não inteira, ausente ou NaN', () => {
      // Act
      const fractional = firstMessage({ ...validRequest(), targetLeadCount: 1.5 });
      const notANumber = firstMessage({ ...validRequest(), targetLeadCount: Number.NaN });

      // Assert
      expect(fractional).toBe('Informe um número inteiro.');
      expect(notANumber).toBe('Informe a quantidade de leads.');
   });

   it('recusa lista de cidades vazia', () => {
      // Act
      const message = firstMessage({ ...validRequest(), locations: [] });

      // Assert
      expect(message).toBe('Escolha ao menos uma cidade.');
   });

   it('aceita 30 cidades e recusa 31', () => {
      // Arrange
      const cities = (count: number) =>
         Array.from({ length: count }, (_, index) => ({ state: 'SP', municipalityCode: String(1000 + index) }));

      // Act
      const atLimit = ZCreateCampaignRequestSchema.safeParse({ ...validRequest(), locations: cities(30) });
      const overLimit = firstMessage({ ...validRequest(), locations: cities(31) });

      // Assert
      expect(atLimit.success).toBe(true);
      expect(overLimit).toBe('Escolha no máximo 30 cidades.');
   });

   it('recusa cidades de UF diferentes e cidade repetida', () => {
      // Act
      const mixedStates = firstMessage({
         ...validRequest(),
         locations: [
            { state: 'SP', municipalityCode: '7107' },
            { state: 'RJ', municipalityCode: '6001' },
         ],
      });
      const repeated = firstMessage({
         ...validRequest(),
         locations: [
            { state: 'SP', municipalityCode: '7107' },
            { state: 'SP', municipalityCode: '7107' },
         ],
      });

      // Assert
      expect(mixedStates).toBe('Todas as cidades devem ser da mesma UF.');
      expect(repeated).toBe('Há cidade repetida.');
   });

   it('recusa lista de CNAE vazia, código fora de 7 dígitos e repetido', () => {
      // Act
      const empty = firstMessage({ ...validRequest(), cnaeCodes: [] });
      const shortCode = firstMessage({ ...validRequest(), cnaeCodes: ['123456'] });
      const repeated = firstMessage({ ...validRequest(), cnaeCodes: ['6201501', '6201501'] });

      // Assert
      expect(empty).toBe('Escolha ao menos um CNAE.');
      expect(shortCode).toBe('CNAE deve ter 7 dígitos.');
      expect(repeated).toBe('Há CNAE repetido.');
   });

   it('aceita 20 CNAE e recusa 21', () => {
      // Arrange
      const codes = (count: number) => Array.from({ length: count }, (_, index) => String(1000000 + index));

      // Act
      const atLimit = ZCreateCampaignRequestSchema.safeParse({ ...validRequest(), cnaeCodes: codes(20) });
      const overLimit = firstMessage({ ...validRequest(), cnaeCodes: codes(21) });

      // Assert
      expect(atLimit.success).toBe(true);
      expect(overLimit).toBe('Escolha no máximo 20 CNAE.');
   });

   it('recusa requestId que não é Guid', () => {
      // Act
      const result = ZCreateCampaignRequestSchema.safeParse({ ...validRequest(), requestId: 'abc' });

      // Assert
      expect(result.success).toBe(false);
   });
});
