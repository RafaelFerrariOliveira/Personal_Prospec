import type { ChangeEvent } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { ECampaignStatus } from '@enums/campaignStatus.enum';
import type { ICampaignService } from '@interfaces/campaign.interface';

export interface ICampaignsControllerDeps {
   campaignService: ICampaignService;
   navigate: NavigateFunction;
   /** location.state cru da rota; o controller valida se veio { campaignCreated: true } do formulário. */
   locationState: unknown;
}

export interface ICampaignRow {
   id: string;
   name: string;
   segment: string;
   locationSummary: string;
   status: ECampaignStatus;
   createdAtLabel: string;
}

export interface ICampaignStatusOption {
   value: string;
   label: string;
}

export interface ICampaignsController {
   rows: ICampaignRow[];
   statusFilter: string;
   statusOptions: ICampaignStatusOption[];
   showCreatedNotice: boolean;
   isLoadingFirstPage: boolean;
   isLoadingMore: boolean;
   hasMore: boolean;
   isEmpty: boolean;
   isFilteredEmpty: boolean;
   errorMessage: string | null;
   sentinelRef: (element: HTMLElement | null) => void;
   onStatusChange: (event: ChangeEvent<HTMLSelectElement>) => void;
   onOpenCampaign: (id: string) => void;
   onCreate: () => void;
   onRetry: () => void;
}

export type ICampaignsViewProps = ICampaignsController;
