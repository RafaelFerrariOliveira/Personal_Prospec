import type { ICampaignFormController, ICampaignStepFieldsProps } from '@pages/CampaignForm/CampaignForm.types';

export interface IProfileStepProps extends ICampaignStepFieldsProps {
   cnaeCodes: ICampaignFormController['cnaeCodes'];
   cnaeLabels: ICampaignFormController['cnaeLabels'];
   onCnaeChange: ICampaignFormController['onCnaeChange'];
}
