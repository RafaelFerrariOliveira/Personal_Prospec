import type { NavigateFunction } from 'react-router-dom';
import type { TIconName } from '@components/icon/icon.types';
import type { ECampaignStatus } from '@enums/campaignStatus.enum';
import type { ICampaignService } from '@interfaces/campaign.interface';

export interface IHomeControllerDeps {
   campaignService: ICampaignService;
   navigate: NavigateFunction;
}

export interface IHomeStat {
   key: string;
   label: string;
   value: string;
   icon: TIconName;
   tone: 'neutral' | 'primary';
}

export interface IHomeRecentRow {
   id: string;
   name: string;
   createdAtLabel: string;
   locationSummary: string;
   status: ECampaignStatus;
}

export interface IHomeController {
   title: string;
   subtitle: string;
   stats: IHomeStat[];
   recentRows: IHomeRecentRow[];
   isLoading: boolean;
   isRecentEmpty: boolean;
   errorMessages: string[];
   onNewCampaign: () => void;
   onSeeAll: () => void;
   onOpenCampaign: (id: string) => void;
   onRetry: () => void;
}

export type IHomeViewProps = IHomeController;
