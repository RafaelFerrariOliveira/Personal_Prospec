import type { ICampaignStepFieldsProps } from '@pages/CampaignForm/CampaignForm.types';

export interface ILeadCountStepProps extends ICampaignStepFieldsProps {
   /** Rótulo pronto do controller, com os limites (ex.: "Quantidade de leads (1 a 500)"). */
   label: string;
}
