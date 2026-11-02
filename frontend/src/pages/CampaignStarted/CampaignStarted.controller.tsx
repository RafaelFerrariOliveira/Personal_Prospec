import { useCallback, useEffect } from 'react';
import { useCampaignDetail } from '@hooks/useCampaignDetail';
import { buildCampaignDetailPath, RoutePaths } from '@routes/routePaths';
import { formatLocationSummary } from '@utils/formatLocationSummary';
import type { ICampaignStartedController, ICampaignStartedControllerDeps } from './CampaignStarted.types';

// Valor de partida sem fonte (research R9): 3 segundos até voltar ao detalhe.
export const DEFAULT_REDIRECT_DELAY_MS = 3000;

const UseCampaignStartedController = ({
   campaignService,
   navigate,
   campaignId,
   redirectDelayMs = DEFAULT_REDIRECT_DELAY_MS,
}: ICampaignStartedControllerDeps): ICampaignStartedController => {
   const { detail, isLoading, isNotFound, errorMessages } = useCampaignDetail(campaignService, campaignId);

   const onOpenDetail = useCallback((): void => {
      if (campaignId) navigate(buildCampaignDetailPath(campaignId), { replace: true });
   }, [navigate, campaignId]);

   const onBackToList = useCallback((): void => {
      void navigate(RoutePaths.campaigns);
   }, [navigate]);

   const isReady = Boolean(detail);

   useEffect(() => {
      if (!isReady || !campaignId) return undefined;
      const timer = setTimeout(() => navigate(buildCampaignDetailPath(campaignId), { replace: true }), redirectDelayMs);
      // O temporizador não sobrevive à saída da página (FR-015).
      return () => clearTimeout(timer);
   }, [isReady, campaignId, navigate, redirectDelayMs]);

   const locationSummary = formatLocationSummary(
      (detail?.locations ?? []).map((location) => ({ state: location.state, name: location.municipalityName })),
   );

   return {
      name: detail?.name ?? '',
      targetLeadCount: detail?.targetLeadCount ?? 0,
      locationSummary,
      isLoading,
      isNotFound,
      errorMessages,
      onOpenDetail,
      onBackToList,
   };
};

export default UseCampaignStartedController;
