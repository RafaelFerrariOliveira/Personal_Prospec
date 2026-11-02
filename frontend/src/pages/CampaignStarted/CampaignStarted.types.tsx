import type { NavigateFunction } from 'react-router-dom';
import type { ICampaignService } from '@interfaces/campaign.interface';

export interface ICampaignStartedControllerDeps {
   campaignService: ICampaignService;
   navigate: NavigateFunction;
   campaignId: string | undefined;
   redirectDelayMs?: number;
}

export interface ICampaignStartedController {
   name: string;
   targetLeadCount: number;
   locationSummary: string;
   isLoading: boolean;
   isNotFound: boolean;
   errorMessages: string[];
   onOpenDetail: () => void;
   onBackToList: () => void;
}

export type ICampaignStartedViewProps = ICampaignStartedController;
