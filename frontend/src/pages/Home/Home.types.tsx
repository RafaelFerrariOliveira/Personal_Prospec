import type { NavigateFunction } from 'react-router-dom';

export interface IHomeControllerDeps {
   navigate: NavigateFunction;
   canShowCampaigns: boolean;
}

export interface IHomeController {
   title: string;
   description: string;
   actionLabel: string;
   onAction: () => void;
   canShowCampaigns: boolean;
   campaignsLabel: string;
   onOpenCampaigns: () => void;
}

export type IHomeViewProps = IHomeController;
