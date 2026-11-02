import type { Container } from 'inversify';
import { CampaignService } from '@application/service/campaign.service';
import type { ICampaignService } from '@interfaces/campaign.interface';
import { CampaignServiceSymbol } from '@ioc/references/campaign.symbols';

export const loadCampaignContainer = (container: Container): void => {
   container.bind<ICampaignService>(CampaignServiceSymbol).to(CampaignService);
};
