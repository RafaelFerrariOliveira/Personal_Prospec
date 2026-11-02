import { useNavigate, useParams } from 'react-router-dom';
import { useInjection } from '@hooks/useInjection';
import type { ICampaignService } from '@interfaces/campaign.interface';
import { CampaignServiceSymbol } from '@ioc/references/campaign.symbols';
import UseCampaignFormController from './CampaignForm.controller';
import CampaignFormView from './CampaignForm.view';

const generateId = (): string => crypto.randomUUID();

const CampaignForm = () => {
   const campaignService = useInjection<ICampaignService>(CampaignServiceSymbol);
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();
   const controller = UseCampaignFormController({ campaignService, navigate, generateId, campaignId: id });

   return <CampaignFormView {...controller} />;
};

export default CampaignForm;
