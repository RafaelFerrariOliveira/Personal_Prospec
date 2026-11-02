import { useInjection } from '@hooks/useInjection';
import type { ICampaignService } from '@interfaces/campaign.interface';
import { CampaignServiceSymbol } from '@ioc/references/campaign.symbols';
import UseCampaignHistoryController from './campaignHistory.controller';
import type { ICampaignHistoryProps } from './campaignHistory.types';
import CampaignHistoryView from './campaignHistory.view';

const CampaignHistory = (props: ICampaignHistoryProps) => {
   const campaignService = useInjection<ICampaignService>(CampaignServiceSymbol);
   const controller = UseCampaignHistoryController({ ...props, campaignService });

   return <CampaignHistoryView {...controller} />;
};

export default CampaignHistory;
