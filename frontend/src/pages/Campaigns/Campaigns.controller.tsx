import { useCallback, useState, type ChangeEvent } from 'react';
import { useInfiniteScrollQuery } from '@hooks/useInfiniteScrollQuery';
import { useIntersectionObserver } from '@hooks/useIntersectionObserver';
import { CAMPAIGN_STATUS_LABELS, ECampaignStatus } from '@enums/campaignStatus.enum';
import type { TCampaignListItem } from '@response/campaignList.response';
import { buildCampaignDetailPath, RoutePaths } from '@routes/routePaths';
import type {
   ICampaignRow,
   ICampaignsController,
   ICampaignsControllerDeps,
   ICampaignStatusOption,
} from './Campaigns.types';

const ERROR_MESSAGE = 'Não foi possível carregar as campanhas. Tente novamente.';
const STATUS_VALUES = Object.values(ECampaignStatus);

const STATUS_OPTIONS: ICampaignStatusOption[] = [
   { value: '', label: 'Todos os estados' },
   ...STATUS_VALUES.map((status) => ({ value: status, label: CAMPAIGN_STATUS_LABELS[status] })),
];

const isCampaignStatus = (value: string): value is ECampaignStatus => (STATUS_VALUES as string[]).includes(value);

// O state da navegação é dado não tipado (pode vir de qualquer navigate): só aceita o formato enviado pelo formulário.
const hasCampaignCreated = (state: unknown): boolean =>
   typeof state === 'object' && state !== null && 'campaignCreated' in state && state.campaignCreated === true;

const formatDate = (iso: string): string => {
   const date = new Date(iso);
   return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('pt-BR');
};

const toRow = (item: TCampaignListItem): ICampaignRow => ({
   id: item.id,
   name: item.name,
   segment: item.segment,
   locationSummary: item.locationSummary,
   status: item.status,
   createdAtLabel: formatDate(item.createdAt),
});

const UseCampaignsController = ({
   campaignService,
   navigate,
   locationState,
}: ICampaignsControllerDeps): ICampaignsController => {
   const [statusFilter, setStatusFilter] = useState('');

   const { items, isLoadingFirstPage, isLoadingMore, hasMore, error, loadMore, reload } = useInfiniteScrollQuery({
      fetchPage: ({ pageNumber, pageSize, filters }, { signal }) =>
         campaignService.getAllCampaigns(
            { pageNumber, pageSize, ...(isCampaignStatus(filters.status) ? { status: filters.status } : {}) },
            { signal },
         ),
      filters: { status: statusFilter },
   });

   const sentinelRef = useIntersectionObserver({ onIntersect: loadMore, enabled: hasMore });

   const onStatusChange = useCallback((event: ChangeEvent<HTMLSelectElement>): void => {
      setStatusFilter(event.target.value);
   }, []);

   const onOpenCampaign = useCallback(
      (id: string): void => {
         void navigate(buildCampaignDetailPath(id));
      },
      [navigate],
   );

   const onCreate = useCallback((): void => {
      void navigate(RoutePaths.campaignNew);
   }, [navigate]);

   const onRetry = useCallback((): void => {
      if (items.length > 0) loadMore();
      else reload();
   }, [items.length, loadMore, reload]);

   const isListEmpty = !isLoadingFirstPage && !error && items.length === 0;

   return {
      rows: items.map(toRow),
      statusFilter,
      statusOptions: STATUS_OPTIONS,
      showCreatedNotice: hasCampaignCreated(locationState),
      isLoadingFirstPage,
      isLoadingMore,
      hasMore,
      isEmpty: isListEmpty && statusFilter === '',
      isFilteredEmpty: isListEmpty && statusFilter !== '',
      errorMessage: error ? ERROR_MESSAGE : null,
      sentinelRef,
      onStatusChange,
      onOpenCampaign,
      onCreate,
      onRetry,
   };
};

export default UseCampaignsController;
