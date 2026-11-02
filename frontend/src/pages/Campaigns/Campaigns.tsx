import { useLocation, useNavigate } from 'react-router-dom';
import { useInjection } from '@hooks/useInjection';
import type { ICampaignService } from '@interfaces/campaign.interface';
import { CampaignServiceSymbol } from '@ioc/references/campaign.symbols';
import UseCampaignsController from './Campaigns.controller';
import CampaignsView from './Campaigns.view';

const Campaigns = () => {
   const campaignService = useInjection<ICampaignService>(CampaignServiceSymbol);
   const navigate = useNavigate();
   const location = useLocation();
   const controller = UseCampaignsController({ campaignService, navigate, locationState: location.state });

   return <CampaignsView {...controller} />;
};

export default Campaigns;
