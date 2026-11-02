import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useInfiniteScrollQuery } from '@hooks/useInfiniteScrollQuery';

type TPage = { items: number[]; totalPages: number; pageNumber: number };
type TFetch = (
   params: { pageNumber: number; pageSize: number; filters: { search: string } },
   options: { signal: AbortSignal },
) => Promise<TPage>;

const pageOf = (pageNumber: number, totalPages: number): TPage => ({
   items: [pageNumber * 10, pageNumber * 10 + 1],
   totalPages,
   pageNumber,
});

describe('useInfiniteScrollQuery', () => {
   it('carrega a primeira página e acumula a segunda no loadMore', async () => {
      // Arrange
      const fetchPage = vi.fn<TFetch>(async ({ pageNumber }) => pageOf(pageNumber, 2));
      const { result } = renderHook(() => useInfiniteScrollQuery({ fetchPage, filters: { search: '' } }));
      await waitFor(() => expect(result.current.items).toEqual([10, 11]));

      // Act
      act(() => result.current.loadMore());
      await waitFor(() => expect(result.current.items).toEqual([10, 11, 20, 21]));

      // Assert
      expect(result.current.hasMore).toBe(false);
      expect(fetchPage.mock.calls[0]?.[0]).toMatchObject({ pageNumber: 1, pageSize: 20 });
   });

   it('loadMore é no-op quando não há mais páginas', async () => {
      // Arrange
      const fetchPage = vi.fn<TFetch>(async ({ pageNumber }) => pageOf(pageNumber, 1));
      const { result } = renderHook(() => useInfiniteScrollQuery({ fetchPage, filters: { search: '' } }));
      await waitFor(() => expect(result.current.items).toHaveLength(2));

      // Act
      act(() => result.current.loadMore());

      // Assert
      expect(fetchPage).toHaveBeenCalledTimes(1);
   });

   it('loadMore em sequência rápida dispara uma única requisição da página seguinte', async () => {
      // Arrange
      let release: (page: TPage) => void = () => undefined;
      const fetchPage = vi.fn<TFetch>(({ pageNumber }) => {
         if (pageNumber === 1) return Promise.resolve(pageOf(1, 3));
         return new Promise<TPage>((resolve) => {
            release = resolve;
         });
      });
      const { result } = renderHook(() => useInfiniteScrollQuery({ fetchPage, filters: { search: '' } }));
      await waitFor(() => expect(result.current.hasMore).toBe(true));

      // Act
      act(() => {
         result.current.loadMore();
         result.current.loadMore();
      });
      await waitFor(() => expect(result.current.isLoadingMore).toBe(true));
      act(() => result.current.loadMore());

      // Assert
      expect(fetchPage).toHaveBeenCalledTimes(2);
      await act(async () => release(pageOf(2, 3)));
      await waitFor(() => expect(result.current.isLoadingMore).toBe(false));
   });

   it('mudar o filtro reinicia a lista e cancela a requisição em andamento', async () => {
      // Arrange
      const signals: AbortSignal[] = [];
      const fetchPage = vi.fn<TFetch>(({ filters, pageNumber }, { signal }) => {
         signals.push(signal);
         if (filters.search === 'a') return new Promise<TPage>(() => undefined);
         return Promise.resolve({ items: [99], totalPages: 1, pageNumber });
      });
      const { result, rerender } = renderHook(
         ({ search }) => useInfiniteScrollQuery({ fetchPage, filters: { search } }),
         {
            initialProps: { search: 'a' },
         },
      );
      await waitFor(() => expect(result.current.isLoadingFirstPage).toBe(true));

      // Act
      rerender({ search: 'b' });
      await waitFor(() => expect(result.current.items).toEqual([99]));

      // Assert
      expect(signals[0]?.aborted).toBe(true);
      expect(signals[1]?.aborted).toBe(false);
   });

   it('erro na página 2 preserva os itens já carregados e expõe o erro', async () => {
      // Arrange
      const failure = new Error('falhou');
      const fetchPage = vi.fn<TFetch>(async ({ pageNumber }) => {
         if (pageNumber === 2) throw failure;
         return pageOf(1, 2);
      });
      const { result } = renderHook(() => useInfiniteScrollQuery({ fetchPage, filters: { search: '' } }));
      await waitFor(() => expect(result.current.items).toHaveLength(2));

      // Act
      act(() => result.current.loadMore());
      await waitFor(() => expect(result.current.error).toBe(failure));

      // Assert
      expect(result.current.items).toEqual([10, 11]);
      expect(result.current.isLoadingMore).toBe(false);
      expect(result.current.hasMore).toBe(true);
   });

   it('erro na primeira página expõe o erro sem itens e reload tenta de novo', async () => {
      // Arrange
      const fetchPage = vi.fn<TFetch>().mockRejectedValueOnce(new Error('falhou')).mockResolvedValueOnce(pageOf(1, 1));
      const { result } = renderHook(() => useInfiniteScrollQuery({ fetchPage, filters: { search: '' } }));
      await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
      expect(result.current.isLoadingFirstPage).toBe(false);

      // Act
      act(() => result.current.reload());
      await waitFor(() => expect(result.current.items).toEqual([10, 11]));

      // Assert
      expect(result.current.error).toBeNull();
   });

   it('não busca enquanto enabled for falso e busca ao habilitar', async () => {
      // Arrange
      const fetchPage = vi.fn<TFetch>(async ({ pageNumber }) => pageOf(pageNumber, 1));
      const { result, rerender } = renderHook(
         ({ enabled }) => useInfiniteScrollQuery({ fetchPage, filters: { search: '' }, enabled }),
         { initialProps: { enabled: false } },
      );
      expect(fetchPage).not.toHaveBeenCalled();

      // Act
      rerender({ enabled: true });
      await waitFor(() => expect(result.current.items).toHaveLength(2));

      // Assert
      expect(fetchPage).toHaveBeenCalledTimes(1);
   });

   it('cancela a requisição ao desmontar', async () => {
      // Arrange
      let captured: AbortSignal | undefined;
      const fetchPage = vi.fn<TFetch>((_params, { signal }) => {
         captured = signal;
         return new Promise<TPage>(() => undefined);
      });
      const { unmount } = renderHook(() => useInfiniteScrollQuery({ fetchPage, filters: { search: '' } }));
      await waitFor(() => expect(captured).toBeDefined());

      // Act
      unmount();

      // Assert
      expect(captured?.aborted).toBe(true);
   });
});
