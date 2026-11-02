import { useCallback } from 'react';
import { useInfiniteScrollQuery } from '@hooks/useInfiniteScrollQuery';
import { useIntersectionObserver } from '@hooks/useIntersectionObserver';
import type { TCampaignEvent } from '@response/campaignEvent.response';
import type {
   ICampaignHistoryController,
   ICampaignHistoryControllerDeps,
   ICampaignHistoryItem,
} from './campaignHistory.types';

const ERROR_MESSAGE = 'Não foi possível carregar o histórico. Tente novamente.';

const EVENT_TITLES: Record<string, string> = {
   CampaignCreated: 'Campanha criada',
   CampaignUpdated: 'Campanha editada',
   CampaignStarted: 'Campanha iniciada',
   CampaignPaused: 'Campanha pausada',
   CampaignResumed: 'Campanha retomada',
   CampaignCancelled: 'Campanha cancelada',
};

const formatDate = (iso: string): string => {
   const date = new Date(iso);
   return Number.isNaN(date.getTime()) ? iso : date.toLocaleString('pt-BR');
};

const toItem = (event: TCampaignEvent, index: number): ICampaignHistoryItem => ({
   key: `${event.occurredAt}-${index}`,
   title: EVENT_TITLES[event.type] ?? event.type,
   description: event.description,
   occurredAtLabel: formatDate(event.occurredAt),
});

const UseCampaignHistoryController = ({
   campaignService,
   campaignId,
   refreshKey,
}: ICampaignHistoryControllerDeps): ICampaignHistoryController => {
   const { items, isLoadingFirstPage, isLoadingMore, hasMore, error, loadMore, reload } = useInfiniteScrollQuery({
      fetchPage: ({ pageNumber, pageSize, filters }, { signal }) =>
         campaignService.getCampaignHistory({ id: filters.campaignId, pageNumber, pageSize }, { signal }),
      filters: { campaignId, refreshKey },
   });

   const sentinelRef = useIntersectionObserver({ onIntersect: loadMore, enabled: hasMore });

   const onRetry = useCallback((): void => {
      if (items.length > 0) loadMore();
      else reload();
   }, [items.length, loadMore, reload]);

   return {
      items: items.map(toItem),
      isLoadingFirstPage,
      isLoadingMore,
      hasMore,
      isEmpty: !isLoadingFirstPage && !error && items.length === 0,
      errorMessage: error ? ERROR_MESSAGE : null,
      sentinelRef,
      onRetry,
   };
};

export default UseCampaignHistoryController;
