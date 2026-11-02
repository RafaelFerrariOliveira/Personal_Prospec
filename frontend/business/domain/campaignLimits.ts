/** Limites da campanha: iguais aos valores de partida de CampaignOptions no backend. Fonte única do front. */
export const CAMPAIGN_LIMITS = {
   nameMaxLength: 120,
   objectiveMaxLength: 500,
   segmentMaxLength: 120,
   longTextMaxLength: 1000,
   minTargetLeadCount: 1,
   maxTargetLeadCount: 500,
   minCities: 1,
   maxCities: 30,
   minCnae: 1,
   maxCnae: 20,
   cnaeCodeLength: 7,
   cnaeSearchMinLength: 2,
   cnaeSearchMaxResults: 20,
   municipalityPageSize: 30,
   // Tamanho máximo de página aceito pela API (máximo do PageParams do backend).
   maxPageSize: 30,
} as const;
