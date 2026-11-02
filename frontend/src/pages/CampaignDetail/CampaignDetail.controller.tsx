import { useCallback } from 'react';
import { useCampaignDetail } from '@hooks/useCampaignDetail';
import type { TCampaignDetailResponse } from '@response/campaignDetail.response';
import { RoutePaths } from '@routes/routePaths';
import { formatLocationSummary } from '@utils/formatLocationSummary';
import type {
   ICampaignDetailController,
   ICampaignDetailControllerDeps,
   ICampaignDetailItem,
} from './CampaignDetail.types';

export const PROGRESS_NOT_RUN_TEXT = 'A pesquisa ainda não foi executada';
const NOT_INFORMED = 'Não informado';

const text = (value: string | null | undefined): string => value?.trim() || NOT_INFORMED;

const toItems = (detail: TCampaignDetailResponse): ICampaignDetailItem[] => {
   const locationSummary = formatLocationSummary(
      detail.locations.map((location) => ({ state: location.state, name: location.municipalityName })),
   );
   const cnae = detail.cnaes.map((item) => `${item.code} ${item.description}`).join('; ');

   return [
      { label: 'Objetivo', value: text(detail.objective) },
      { label: 'Localização', value: locationSummary || NOT_INFORMED },
      { label: 'Perfil ideal', value: text(detail.idealProfile) },
      { label: 'Segmento', value: text(detail.segment) },
      { label: 'CNAE', value: text(cnae) },
      { label: 'Serviços', value: text(detail.services) },
      { label: 'Diferenciais', value: text(detail.differentials) },
      { label: 'Proposta de valor', value: text(detail.valueProposition) },
      { label: 'Meta de leads', value: String(detail.targetLeadCount) },
   ];
};

const toProgressText = (detail: TCampaignDetailResponse): string => {
   const { progress } = detail;
   if (!progress) return PROGRESS_NOT_RUN_TEXT;
   return `Encontradas: ${progress.found}. Qualificadas: ${progress.qualified}. Pendentes: ${progress.pending}. Meta: ${progress.target}.`;
};

const UseCampaignDetailController = ({
   campaignService,
   navigate,
   campaignId,
}: ICampaignDetailControllerDeps): ICampaignDetailController => {
   const { detail, isLoading, isNotFound, errorMessages, reload } = useCampaignDetail(campaignService, campaignId);

   const onBackToList = useCallback((): void => {
      void navigate(RoutePaths.campaigns);
   }, [navigate]);

   return {
      campaignId: campaignId ?? '',
      name: detail?.name ?? '',
      status: detail?.status ?? null,
      items: detail ? toItems(detail) : [],
      progressText: detail ? toProgressText(detail) : PROGRESS_NOT_RUN_TEXT,
      refreshKey: detail ? `${detail.status}-${detail.updatedAt}` : '',
      isLoading: isLoading && !detail,
      isNotFound,
      errorMessages,
      onChanged: reload,
      onRetry: reload,
      onBackToList,
   };
};

export default UseCampaignDetailController;
