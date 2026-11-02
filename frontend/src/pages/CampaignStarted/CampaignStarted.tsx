import { useNavigate, useParams } from 'react-router-dom';
import { useInjection } from '@hooks/useInjection';
import type { ICampaignService } from '@interfaces/campaign.interface';
import { CampaignServiceSymbol } from '@ioc/references/campaign.symbols';
import UseCampaignStartedController from './CampaignStarted.controller';
import CampaignStartedView from './CampaignStarted.view';

const CampaignStarted = () => {
   const campaignService = useInjection<ICampaignService>(CampaignServiceSymbol);
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();
   const controller = UseCampaignStartedController({ campaignService, navigate, campaignId: id });

   return <CampaignStartedView {...controller} />;
};

export default CampaignStarted;
