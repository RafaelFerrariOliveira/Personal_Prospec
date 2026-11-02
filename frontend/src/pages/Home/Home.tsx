import { useNavigate } from 'react-router-dom';
import { useInjection } from '@hooks/useInjection';
import type { ICampaignService } from '@interfaces/campaign.interface';
import { CampaignServiceSymbol } from '@ioc/references/campaign.symbols';
import UseHomeController from './Home.controller';
import HomeView from './Home.view';

const Home = () => {
   const campaignService = useInjection<ICampaignService>(CampaignServiceSymbol);
   const navigate = useNavigate();
   const controller = UseHomeController({ campaignService, navigate });

   return <HomeView {...controller} />;
};

export default Home;
