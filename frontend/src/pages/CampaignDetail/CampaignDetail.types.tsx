import type { NavigateFunction } from 'react-router-dom';
import type { ECampaignStatus } from '@enums/campaignStatus.enum';
import type { ICampaignService } from '@interfaces/campaign.interface';

export interface ICampaignDetailControllerDeps {
   campaignService: ICampaignService;
   navigate: NavigateFunction;
   campaignId: string | undefined;
}

export interface ICampaignDetailItem {
   label: string;
   value: string;
}

export interface ICampaignDetailController {
   campaignId: string;
   name: string;
   status: ECampaignStatus | null;
   items: ICampaignDetailItem[];
   progressText: string;
   refreshKey: string;
   isLoading: boolean;
   isNotFound: boolean;
   errorMessages: string[];
   onChanged: () => void;
   onRetry: () => void;
   onBackToList: () => void;
}

export type ICampaignDetailViewProps = ICampaignDetailController;
