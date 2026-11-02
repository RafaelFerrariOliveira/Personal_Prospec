import { act, renderHook, waitFor } from '@testing-library/react';
import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { useCampaignDetail } from '@hooks/useCampaignDetail';
import { ApiError } from '@domain/errors/api-error';
import { ECampaignStatus } from '@enums/campaignStatus.enum';
import type { ICampaignService } from '@interfaces/campaign.interface';
import type { TCampaignDetailResponse } from '@response/campaignDetail.response';

type TGetById = ICampaignService['getCampaignById'];

const ID_A = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';
const ID_B = '4f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6c';

const detail = (id: string, name: string): TCampaignDetailResponse => ({
   id,
   name,
   objective: 'Objetivo',
   idealProfile: null,
   segment: 'Tecnologia',
   services: null,
   differentials: null,
   valueProposition: null,
   targetLeadCount: 10,
   locations: [{ state: 'SP', municipalityCode: '7107', municipalityName: 'SAO PAULO' }],
   cnaes: [{ code: '6201501', description: 'Software' }],
   status: ECampaignStatus.Draft,
   createdAt: '2026-11-02T10:00:00Z',
   updatedAt: '2026-11-02T10:00:00Z',
   progress: null,
});

// O Service é criado uma vez por teste, estável entre renders como o container IoC entrega.
const serviceWith = (getCampaignById: TGetById): ICampaignService =>
   ({ getCampaignById }) as unknown as ICampaignService;

describe('useCampaignDetail', () => {
   it('carrega o detalhe e encerra o carregamento', async () => {
      // Arrange
      const getCampaignById = vi.fn<TGetById>().mockResolvedValue(detail(ID_A, 'Campanha A'));
      const service = serviceWith(getCampaignById);

      // Act
      const { result } = renderHook(() => useCampaignDetail(service, ID_A));

      // Assert
      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.detail?.name).toBe('Campanha A');
      expect(result.current.isNotFound).toBe(false);
      expect(result.current.errorMessages).toEqual([]);
      expect(getCampaignById.mock.calls[0]?.[0]).toBe(ID_A);
   });

   it('resposta null (inexistente ou de outra unidade) vira não encontrada', async () => {
      // Arrange
      const service = serviceWith(vi.fn<TGetById>().mockResolvedValue(null));

      // Act
      const { result } = renderHook(() => useCampaignDetail(service, ID_A));

      // Assert
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isNotFound).toBe(true);
      expect(result.current.detail).toBeNull();
   });

   it('sem id não chama o Service e marca não encontrada', () => {
      // Arrange
      const getCampaignById = vi.fn<TGetById>();

      // Act
      const { result } = renderHook(() => useCampaignDetail(serviceWith(getCampaignById), undefined));

      // Assert
      expect(getCampaignById).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isNotFound).toBe(true);
   });

   it.each([
      ['400 com mensagens da API', new ApiError(['Campanha inválida.'], 400), ['Campanha inválida.']],
      [
         '401',
         new AxiosError('falha', '401', undefined, null, { status: 401 } as AxiosResponse),
         ['Sua sessão expirou. Entre novamente para continuar.'],
      ],
      [
         'erro de rede',
         new AxiosError('Network Error'),
         ['Não foi possível carregar a campanha. Tente novamente em instantes.'],
      ],
   ])('%s vira mensagem de erro e encerra o carregamento', async (_name, failure, expected) => {
      // Arrange
      const service = serviceWith(vi.fn<TGetById>().mockRejectedValue(failure));

      // Act
      const { result } = renderHook(() => useCampaignDetail(service, ID_A));

      // Assert
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.errorMessages).toEqual(expected);
      expect(result.current.isNotFound).toBe(false);
   });

   it('reload busca de novo e limpa o erro anterior', async () => {
      // Arrange
      const getCampaignById = vi
         .fn<TGetById>()
         .mockRejectedValueOnce(new AxiosError('Network Error'))
         .mockResolvedValueOnce(detail(ID_A, 'Campanha A'));
      const service = serviceWith(getCampaignById);
      const { result } = renderHook(() => useCampaignDetail(service, ID_A));
      await waitFor(() => expect(result.current.errorMessages).toHaveLength(1));

      // Act
      act(() => result.current.reload());

      // Assert
      await waitFor(() => expect(result.current.detail?.name).toBe('Campanha A'));
      expect(result.current.errorMessages).toEqual([]);
      expect(getCampaignById).toHaveBeenCalledTimes(2);
   });

   it('cancela a requisição ao desmontar e não atualiza o estado depois', async () => {
      // Arrange
      let release: (value: TCampaignDetailResponse) => void = () => undefined;
      let captured: AbortSignal | undefined;
      const service = serviceWith(
         vi.fn<TGetById>((_id, options) => {
            captured = options?.signal;
            return new Promise<TCampaignDetailResponse>((resolve) => (release = resolve));
         }),
      );
      const { result, unmount } = renderHook(() => useCampaignDetail(service, ID_A));

      // Act
      unmount();
      await act(async () => release(detail(ID_A, 'Tarde demais')));

      // Assert
      expect(captured?.aborted).toBe(true);
      expect(result.current.detail).toBeNull();
   });

   it('trocar de id cancela a requisição anterior e descarta a resposta atrasada', async () => {
      // Arrange
      const signals: AbortSignal[] = [];
      let releaseFirst: (value: TCampaignDetailResponse) => void = () => undefined;
      const getCampaignById = vi.fn<TGetById>((id, options) => {
         if (options?.signal) signals.push(options.signal);
         if (id === ID_A) return new Promise<TCampaignDetailResponse>((resolve) => (releaseFirst = resolve));
         return Promise.resolve(detail(ID_B, 'Campanha B'));
      });
      const service = serviceWith(getCampaignById);
      const { result, rerender } = renderHook(({ id }) => useCampaignDetail(service, id), {
         initialProps: { id: ID_A },
      });

      // Act
      rerender({ id: ID_B });
      await waitFor(() => expect(result.current.detail?.name).toBe('Campanha B'));
      await act(async () => releaseFirst(detail(ID_A, 'Campanha A atrasada')));

      // Assert
      expect(signals[0]?.aborted).toBe(true);
      expect(result.current.detail?.name).toBe('Campanha B');
   });
});
