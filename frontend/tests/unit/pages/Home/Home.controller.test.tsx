import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError, type AxiosResponse } from 'axios';
import { useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ECampaignStatus } from '@enums/campaignStatus.enum';
import type { ICampaignService } from '@interfaces/campaign.interface';
import UseHomeController from '@pages/Home/Home.controller';
import HomeView from '@pages/Home/Home.view';
import type { TCampaignListResponse } from '@response/campaignList.response';
import { buildCampaignDetailPath, RoutePaths } from '@routes/routePaths';

type TGetAll = ICampaignService['getAllCampaigns'];

const ID_A = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';
const ID_B = '4f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6c';

const page = (ids: string[], totalCount: number): TCampaignListResponse => ({
   items: ids.map((id, index) => ({
      id,
      name: `Campanha ${index}`,
      segment: 'Tecnologia',
      locationSummary: 'SP, 3 cidades',
      status: index === 0 ? ECampaignStatus.Running : ECampaignStatus.Draft,
      createdAt: '2026-11-02T10:00:00Z',
   })),
   totalCount,
   pageNumber: 1,
   pageSize: 5,
   totalPages: 1,
});

// Primeira chamada: lista recente (total); segunda: filtro Running (em execução).
const serviceReturning = (recent: TCampaignListResponse, running: TCampaignListResponse) =>
   vi.fn<TGetAll>((request) => Promise.resolve(request.status === ECampaignStatus.Running ? running : recent));

const Harness = ({
   getAllCampaigns,
   navigate = vi.fn(),
}: {
   getAllCampaigns: ReturnType<typeof vi.fn<TGetAll>>;
   navigate?: ReturnType<typeof vi.fn>;
}) => {
   // Service estável entre renders, como o container IoC entrega.
   const [campaignService] = useState(() => ({ getAllCampaigns }) as unknown as ICampaignService);
   const controller = UseHomeController({ campaignService, navigate: navigate as unknown as NavigateFunction });
   return <HomeView {...controller} />;
};

describe('UseHomeController', () => {
   it('mostra o total e as em execução pelo totalCount, sem baixar páginas inteiras', async () => {
      // Arrange
      const getAllCampaigns = serviceReturning(page([ID_A, ID_B], 12), page([ID_A], 3));

      // Act
      render(<Harness getAllCampaigns={getAllCampaigns} />);

      // Assert
      await waitFor(() => expect(screen.getByTestId('home-stat-total-value').textContent).toBe('12'));
      expect(screen.getByTestId('home-stat-running-value').textContent).toBe('3');
      expect(getAllCampaigns).toHaveBeenCalledTimes(2);
      expect(getAllCampaigns.mock.calls[0]?.[0]).toEqual({ pageNumber: 1, pageSize: 5 });
      expect(getAllCampaigns.mock.calls[1]?.[0]).toEqual({
         status: ECampaignStatus.Running,
         pageNumber: 1,
         pageSize: 1,
      });
   });

   it('lista até 5 campanhas recentes com data, localização e estado e abre o detalhe', async () => {
      // Arrange
      const navigate = vi.fn();
      const ids = ['a', 'b', 'c', 'd', 'e', 'f'].map((letter) => `${letter}f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b`);
      render(<Harness getAllCampaigns={serviceReturning(page(ids, 6), page([], 0))} navigate={navigate} />);

      // Act
      const firstRow = await screen.findByTestId(`home-recent-row-${ids[0]}`);
      fireEvent.click(firstRow);

      // Assert
      expect(screen.getByTestId('home-recent').querySelectorAll('[data-testid^="home-recent-row-"]')).toHaveLength(5);
      expect(firstRow.textContent).toContain('Campanha 0');
      expect(firstRow.textContent).toContain('Criada em 02/11/2026');
      expect(firstRow.textContent).toContain('SP, 3 cidades');
      expect(firstRow.textContent).toContain('Em execução');
      expect(navigate).toHaveBeenCalledWith(buildCampaignDetailPath(ids[0] ?? ''));
   });

   it('sem campanhas mostra zero nos cartões e a mensagem de lista vazia', async () => {
      // Act
      render(<Harness getAllCampaigns={serviceReturning(page([], 0), page([], 0))} />);

      // Assert
      expect(await screen.findByTestId('home-recent-empty')).toBeTruthy();
      expect(screen.getByTestId('home-stat-total-value').textContent).toBe('0');
      expect(screen.getByTestId('home-stat-running-value').textContent).toBe('0');
   });

   it('enquanto carrega mostra reticências nos cartões e o aviso de carregamento', () => {
      // Act
      render(<Harness getAllCampaigns={vi.fn<TGetAll>(() => new Promise<TCampaignListResponse>(() => undefined))} />);

      // Assert
      expect(screen.getByTestId('home-stat-total-value').textContent).toBe('...');
      expect(screen.getByTestId('home-loading')).toBeTruthy();
   });

   it('Nova campanha e Ver todas navegam para o formulário e para a lista', async () => {
      // Arrange
      const navigate = vi.fn();
      render(<Harness getAllCampaigns={serviceReturning(page([], 0), page([], 0))} navigate={navigate} />);
      await screen.findByTestId('home-recent-empty');

      // Act
      fireEvent.click(screen.getByTestId('home-new-campaign'));
      fireEvent.click(screen.getByTestId('home-see-all'));

      // Assert
      expect(navigate.mock.calls).toEqual([[RoutePaths.campaignNew], [RoutePaths.campaigns]]);
   });

   it.each([
      ['401', new AxiosError('falha', '401', undefined, null, { status: 401 } as AxiosResponse), 'Sua sessão expirou.'],
      ['erro de rede', new AxiosError('Network Error'), 'Não foi possível carregar a visão geral.'],
   ])('%s mostra mensagem, traço nos cartões e permite tentar de novo', async (_name, failure, expected) => {
      // Arrange
      const getAllCampaigns = vi
         .fn<TGetAll>()
         .mockRejectedValueOnce(failure)
         .mockRejectedValueOnce(failure)
         .mockImplementation((request) =>
            Promise.resolve(request.status === ECampaignStatus.Running ? page([], 1) : page([ID_A], 4)),
         );
      render(<Harness getAllCampaigns={getAllCampaigns} />);
      expect((await screen.findByTestId('home-errors')).textContent).toContain(expected);
      expect(screen.getByTestId('home-stat-total-value').textContent).toBe('-');

      // Act
      fireEvent.click(screen.getByTestId('home-retry'));

      // Assert
      await waitFor(() => expect(screen.getByTestId('home-stat-total-value').textContent).toBe('4'));
      expect(screen.queryByTestId('home-errors')).toBeNull();
   });

   it('falha que chega depois de sair da página é descartada', async () => {
      // Arrange
      let fail: (reason: unknown) => void = () => undefined;
      const getAllCampaigns = vi.fn<TGetAll>(
         () => new Promise<TCampaignListResponse>((_resolve, reject) => (fail = reject)),
      );
      const { unmount } = render(<Harness getAllCampaigns={getAllCampaigns} />);

      // Act
      unmount();
      await act(async () => fail(new AxiosError('Network Error')));

      // Assert
      expect(screen.queryByTestId('home-errors')).toBeNull();
   });

   it('cancela as requisições ao sair da página e não atualiza o estado depois', async () => {
      // Arrange
      const signals: AbortSignal[] = [];
      let release: (value: TCampaignListResponse) => void = () => undefined;
      const getAllCampaigns = vi.fn<TGetAll>((_request, options) => {
         if (options?.signal) signals.push(options.signal);
         return new Promise<TCampaignListResponse>((resolve) => (release = resolve));
      });
      const { unmount } = render(<Harness getAllCampaigns={getAllCampaigns} />);

      // Act
      unmount();
      await act(async () => release(page([ID_A], 1)));

      // Assert
      expect(signals).toHaveLength(2);
      expect(signals.every((signal) => signal.aborted)).toBe(true);
   });
});
