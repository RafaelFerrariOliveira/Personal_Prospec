// Fonte única de URL por tela (ver react-router.md). Página nunca usa path hardcoded.
export const RoutePaths = {
   login: '/',
   home: '/home',
   campaigns: '/campaigns',
   campaignNew: '/campaigns/new',
   // Padrões com parâmetro (para o <Route>); para navegar use as funções de montagem abaixo.
   campaignDetail: '/campaigns/:id',
   campaignEdit: '/campaigns/:id/edit',
   campaignStarted: '/campaigns/:id/started',
} as const;

export const buildCampaignDetailPath = (id: string): string => `/campaigns/${id}`;
export const buildCampaignEditPath = (id: string): string => `/campaigns/${id}/edit`;
export const buildCampaignStartedPath = (id: string): string => `/campaigns/${id}/started`;
