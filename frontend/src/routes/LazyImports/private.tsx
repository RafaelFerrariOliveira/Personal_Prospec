import { lazy } from 'react';

// React.lazy() de cada página privada (protegidas por AuthRequiredRoutes).
export const LazyImports = {
   Home: lazy(() => import('@pages/Home/Home')),
   Campaigns: lazy(() => import('@pages/Campaigns/Campaigns')),
   CampaignForm: lazy(() => import('@pages/CampaignForm/CampaignForm')),
   CampaignDetail: lazy(() => import('@pages/CampaignDetail/CampaignDetail')),
   CampaignStarted: lazy(() => import('@pages/CampaignStarted/CampaignStarted')),
};
