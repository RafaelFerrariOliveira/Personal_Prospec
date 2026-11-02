import type { ICampaignService } from '@interfaces/campaign.interface';

export interface ICampaignHistoryProps {
   campaignId: string;
   /** Muda quando o estado da campanha muda; reinicia a lista para mostrar o evento novo. */
   refreshKey: string;
}

export interface ICampaignHistoryControllerDeps extends ICampaignHistoryProps {
   campaignService: ICampaignService;
}

export interface ICampaignHistoryItem {
   key: string;
   title: string;
   description: string;
   occurredAtLabel: string;
}

export interface ICampaignHistoryController {
   items: ICampaignHistoryItem[];
   isLoadingFirstPage: boolean;
   isLoadingMore: boolean;
   hasMore: boolean;
   isEmpty: boolean;
   errorMessage: string | null;
   sentinelRef: (element: HTMLElement | null) => void;
   onRetry: () => void;
}

export type ICampaignHistoryViewProps = ICampaignHistoryController;
