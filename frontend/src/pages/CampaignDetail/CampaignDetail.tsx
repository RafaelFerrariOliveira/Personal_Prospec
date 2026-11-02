import { useNavigate, useParams } from 'react-router-dom';
import { useInjection } from '@hooks/useInjection';
import type { ICampaignService } from '@interfaces/campaign.interface';
import { CampaignServiceSymbol } from '@ioc/references/campaign.symbols';
import UseCampaignDetailController from './CampaignDetail.controller';
import CampaignDetailView from './CampaignDetail.view';

const CampaignDetail = () => {
   const campaignService = useInjection<ICampaignService>(CampaignServiceSymbol);
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();
   const controller = UseCampaignDetailController({ campaignService, navigate, campaignId: id });

   return <CampaignDetailView {...controller} />;
};

export default CampaignDetail;
