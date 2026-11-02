import { useCallback, useEffect, useState } from 'react';
import { ECampaignStatus } from '@enums/campaignStatus.enum';
import type { TCampaignListItem } from '@response/campaignList.response';
import { buildCampaignDetailPath, RoutePaths } from '@routes/routePaths';
import { toApiErrorMessages } from '@utils/apiErrorMessages';
import { formatDate } from '@utils/formatDate';
import type { IHomeController, IHomeControllerDeps, IHomeRecentRow } from './Home.types';

const RECENT_LIMIT = 5;
const GENERIC_ERROR_MESSAGE = 'Não foi possível carregar a visão geral. Tente novamente em instantes.';
const LOADING_VALUE = '...';
const UNAVAILABLE_VALUE = '-';

interface IHomeSummary {
   total: number;
   running: number;
   recent: TCampaignListItem[];
}

const toRow = (item: TCampaignListItem): IHomeRecentRow => ({
   id: item.id,
   name: item.name,
   createdAtLabel: `Criada em ${formatDate(item.createdAt)}`,
   locationSummary: item.locationSummary,
   status: item.status,
});

const UseHomeController = ({ campaignService, navigate }: IHomeControllerDeps): IHomeController => {
   const [summary, setSummary] = useState<IHomeSummary | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [errorMessages, setErrorMessages] = useState<string[]>([]);
   const [reloadToken, setReloadToken] = useState(0);

   useEffect(() => {
      const controller = new AbortController();
      setIsLoading(true);
      setErrorMessages([]);
      const load = async (): Promise<void> => {
         try {
            // Os indicadores vêm do totalCount: a primeira página (até 5) serve à lista recente e ao total,
            // e a contagem de "em execução" pede só 1 item filtrado, sem baixar páginas inteiras.
            const [recentPage, runningPage] = await Promise.all([
               campaignService.getAllCampaigns(
                  { pageNumber: 1, pageSize: RECENT_LIMIT },
                  { signal: controller.signal },
               ),
               campaignService.getAllCampaigns(
                  { status: ECampaignStatus.Running, pageNumber: 1, pageSize: 1 },
                  { signal: controller.signal },
               ),
            ]);
            if (controller.signal.aborted) return;
            setSummary({
               total: recentPage.totalCount,
               running: runningPage.totalCount,
               recent: recentPage.items.slice(0, RECENT_LIMIT),
            });
         } catch (error: unknown) {
            if (controller.signal.aborted) return;
            setErrorMessages(toApiErrorMessages(error, GENERIC_ERROR_MESSAGE));
         } finally {
            if (!controller.signal.aborted) setIsLoading(false);
         }
      };
      void load();
      return () => controller.abort();
   }, [campaignService, reloadToken]);

   const onNewCampaign = useCallback((): void => {
      void navigate(RoutePaths.campaignNew);
   }, [navigate]);

   const onSeeAll = useCallback((): void => {
      void navigate(RoutePaths.campaigns);
   }, [navigate]);

   const onOpenCampaign = useCallback(
      (id: string): void => {
         void navigate(buildCampaignDetailPath(id));
      },
      [navigate],
   );

   const onRetry = useCallback((): void => setReloadToken((token) => token + 1), []);

   const valueOf = (count: number | undefined): string => {
      if (isLoading) return LOADING_VALUE;
      return count === undefined ? UNAVAILABLE_VALUE : String(count);
   };

   return {
      title: 'Visão geral',
      subtitle: 'Acompanhe suas atividades de prospecção.',
      stats: [
         { key: 'total', label: 'Total de campanhas', value: valueOf(summary?.total), icon: 'target', tone: 'neutral' },
         {
            key: 'running',
            label: 'Campanhas em execução',
            value: valueOf(summary?.running),
            icon: 'activity',
            tone: 'primary',
         },
      ],
      recentRows: (summary?.recent ?? []).map(toRow),
      isLoading,
      isRecentEmpty: !isLoading && summary !== null && summary.recent.length === 0,
      errorMessages,
      onNewCampaign,
      onSeeAll,
      onOpenCampaign,
      onRetry,
   };
};

export default UseHomeController;
