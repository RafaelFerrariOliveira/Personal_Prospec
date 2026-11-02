import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_PAGE_SIZE = 20;

interface IPageResult<TItem> {
   items: TItem[];
   totalPages: number;
   pageNumber: number;
}

export interface IUseInfiniteScrollQueryParams<TItem, TFilters> {
   fetchPage: (
      params: { pageNumber: number; pageSize: number; filters: TFilters },
      options: { signal: AbortSignal },
   ) => Promise<IPageResult<TItem>>;
   filters: TFilters;
   pageSize?: number;
   enabled?: boolean;
}

export interface IUseInfiniteScrollQueryResult<TItem> {
   items: TItem[];
   isLoadingFirstPage: boolean;
   isLoadingMore: boolean;
   hasMore: boolean;
   error: unknown;
   loadMore: () => void;
   reload: () => void;
}

/**
 * Acumula páginas de uma lista paginada (ver infinite-scroll-pagination.md).
 * Mudar `filters` (comparado por JSON) ou chamar `reload` reinicia da página 1 e cancela a requisição em andamento.
 * O debounce de busca livre é responsabilidade do controller que monta `filters`.
 */
export const useInfiniteScrollQuery = <TItem, TFilters>({
   fetchPage,
   filters,
   pageSize = DEFAULT_PAGE_SIZE,
   enabled = true,
}: IUseInfiniteScrollQueryParams<TItem, TFilters>): IUseInfiniteScrollQueryResult<TItem> => {
   const [items, setItems] = useState<TItem[]>([]);
   const [pageNumber, setPageNumber] = useState(0);
   const [totalPages, setTotalPages] = useState(0);
   const [isLoadingFirstPage, setIsLoadingFirstPage] = useState(false);
   const [isLoadingMore, setIsLoadingMore] = useState(false);
   const [error, setError] = useState<unknown>(null);
   const [reloadToken, setReloadToken] = useState(0);
   const abortRef = useRef<AbortController | null>(null);
   const isBusyRef = useRef(false);
   const fetchPageRef = useRef(fetchPage);
   const filtersRef = useRef(filters);
   const filtersKey = JSON.stringify(filters);

   useEffect(() => {
      fetchPageRef.current = fetchPage;
      filtersRef.current = filters;
   });

   const run = useCallback(
      async (targetPage: number): Promise<void> => {
         abortRef.current?.abort();
         const controller = new AbortController();
         abortRef.current = controller;
         isBusyRef.current = true;
         const isFirst = targetPage === 1;
         setError(null);
         if (isFirst) setIsLoadingFirstPage(true);
         else setIsLoadingMore(true);
         try {
            const page = await fetchPageRef.current(
               { pageNumber: targetPage, pageSize, filters: filtersRef.current },
               { signal: controller.signal },
            );
            if (controller.signal.aborted) return;
            setItems((previous) => (isFirst ? page.items : [...previous, ...page.items]));
            setPageNumber(targetPage);
            setTotalPages(page.totalPages);
         } catch (caught: unknown) {
            if (controller.signal.aborted) return;
            setError(caught);
         } finally {
            if (abortRef.current === controller) {
               isBusyRef.current = false;
               setIsLoadingFirstPage(false);
               setIsLoadingMore(false);
            }
         }
      },
      [pageSize],
   );

   useEffect(() => {
      abortRef.current?.abort();
      isBusyRef.current = false;
      setItems([]);
      setPageNumber(0);
      setTotalPages(0);
      setError(null);
      if (!enabled) {
         setIsLoadingFirstPage(false);
         setIsLoadingMore(false);
         return undefined;
      }
      void run(1);
      return () => abortRef.current?.abort();
   }, [filtersKey, enabled, reloadToken, run]);

   const hasMore = pageNumber > 0 && pageNumber < totalPages;

   const loadMore = useCallback((): void => {
      if (!hasMore || isBusyRef.current) return;
      void run(pageNumber + 1);
   }, [hasMore, pageNumber, run]);

   const reload = useCallback((): void => {
      setReloadToken((token) => token + 1);
   }, []);

   return { items, isLoadingFirstPage, isLoadingMore, hasMore, error, loadMore, reload };
};
