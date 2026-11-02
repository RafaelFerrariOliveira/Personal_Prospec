import { useNavigate } from 'react-router-dom';
import { useAccessControl } from '@access/hooks/useAccessControl';
import { PermissionKeys } from '@access/types/permissionKeys';
import UseHomeController from './Home.controller';
import HomeView from './Home.view';

const Home = () => {
   const navigate = useNavigate();
   const { canShowMenuItem } = useAccessControl();
   const controller = UseHomeController({
      navigate,
      canShowCampaigns: canShowMenuItem(PermissionKeys.menu.campaigns),
   });

   return <HomeView {...controller} />;
};

export default Home;
