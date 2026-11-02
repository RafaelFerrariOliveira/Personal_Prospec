/** Estado da campanha como a API devolve (string em inglês). */
export enum ECampaignStatus {
   Draft = 'Draft',
   Running = 'Running',
   Paused = 'Paused',
   Completed = 'Completed',
   Cancelled = 'Cancelled',
}

export const CAMPAIGN_STATUS_LABELS: Record<ECampaignStatus, string> = {
   [ECampaignStatus.Draft]: 'Rascunho',
   [ECampaignStatus.Running]: 'Em execução',
   [ECampaignStatus.Paused]: 'Pausada',
   [ECampaignStatus.Completed]: 'Concluída',
   [ECampaignStatus.Cancelled]: 'Cancelada',
};
