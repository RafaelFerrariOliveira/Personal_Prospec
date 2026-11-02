import type { NavigateFunction } from 'react-router-dom';
import type { ECampaignStatus } from '@enums/campaignStatus.enum';
import type { ICampaignService } from '@interfaces/campaign.interface';

export interface ICampaignActionsProps {
   campaignId: string;
   status: ECampaignStatus;
   /** Chamado depois de pausar, retomar ou cancelar com sucesso, para a tela recarregar o detalhe. */
   onChanged: () => void;
}

export interface ICampaignActionsControllerDeps extends ICampaignActionsProps {
   campaignService: ICampaignService;
   navigate: NavigateFunction;
}

export interface ICampaignActionsController {
   canStart: boolean;
   canPause: boolean;
   canResume: boolean;
   canCancel: boolean;
   canEdit: boolean;
   isBusy: boolean;
   isConfirmingCancel: boolean;
   editBlockedHint: string | null;
   errorMessages: string[];
   onStart: () => void;
   onPause: () => void;
   onResume: () => void;
   onEdit: () => void;
   onRequestCancel: () => void;
   onConfirmCancel: () => void;
   onDismissCancel: () => void;
}

export type ICampaignActionsViewProps = ICampaignActionsController;
