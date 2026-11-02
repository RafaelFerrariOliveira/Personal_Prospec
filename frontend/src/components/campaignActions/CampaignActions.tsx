import { useNavigate } from 'react-router-dom';
import { useInjection } from '@hooks/useInjection';
import type { ICampaignService } from '@interfaces/campaign.interface';
import { CampaignServiceSymbol } from '@ioc/references/campaign.symbols';
import UseCampaignActionsController from './campaignActions.controller';
import type { ICampaignActionsProps } from './campaignActions.types';
import CampaignActionsView from './campaignActions.view';

const CampaignActions = (props: ICampaignActionsProps) => {
   const campaignService = useInjection<ICampaignService>(CampaignServiceSymbol);
   const navigate = useNavigate();
   const controller = UseCampaignActionsController({ ...props, campaignService, navigate });

   return <CampaignActionsView {...controller} />;
};

export default CampaignActions;
