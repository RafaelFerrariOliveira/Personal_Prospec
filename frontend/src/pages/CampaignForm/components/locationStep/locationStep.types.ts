import type { ICampaignFormController } from '@pages/CampaignForm/CampaignForm.types';

export interface ILocationStepProps {
   locations: ICampaignFormController['locations'];
   cityLabels: ICampaignFormController['cityLabels'];
   onLocationsChange: ICampaignFormController['onLocationsChange'];
   errorMessage: string | undefined;
}
