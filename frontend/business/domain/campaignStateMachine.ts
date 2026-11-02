import { ECampaignStatus } from '@enums/campaignStatus.enum';

/** Espelho da CampaignStateMachine do backend: o front só habilita o que o backend aceita. Completed e Cancelled são finais. */
export const CampaignStateMachine = {
   canStart: (status: ECampaignStatus): boolean => status === ECampaignStatus.Draft,
   canPause: (status: ECampaignStatus): boolean => status === ECampaignStatus.Running,
   canResume: (status: ECampaignStatus): boolean => status === ECampaignStatus.Paused,
   canCancel: (status: ECampaignStatus): boolean =>
      status === ECampaignStatus.Draft || status === ECampaignStatus.Running || status === ECampaignStatus.Paused,
   canEdit: (status: ECampaignStatus): boolean => status === ECampaignStatus.Draft || status === ECampaignStatus.Paused,
} as const;

export const CAMPAIGN_EDIT_BLOCKED_MESSAGE =
   'Só é possível editar em Rascunho ou Pausada. Pause a campanha antes de editar.';
