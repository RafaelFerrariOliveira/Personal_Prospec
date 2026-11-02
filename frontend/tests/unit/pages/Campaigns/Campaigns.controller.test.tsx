import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ECampaignStatus } from '@enums/campaignStatus.enum';
import type { ICampaignService } from '@interfaces/campaign.interface';
import UseCampaignsController from '@pages/Campaigns/Campaigns.controller';
import CampaignsView from '@pages/Campaigns/Campaigns.view';
import type { TCampaignListResponse } from '@response/campaignList.response';
import { buildCampaignDetailPath, RoutePaths } from '@routes/routePaths';

type TGetAll = ICampaignService['getAllCampaigns'];

const ID_A = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';
const ID_B = '4f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6c';

const page = (ids: string[], totalPages = 1): TCampaignListResponse => ({
   items: ids.map((id, index) => ({
      id,
      name: `Campanha ${index}`,
      segment: 'Tecnologia',
      locationSummary: 'SP, 3 cidades',
      status: index === 0 ? ECampaignStatus.Running : ECampaignStatus.Draft,
      createdAt: '2026-11-02T10:00:00Z',
   })),
   totalCount: ids.length,
   pageNumber: 1,
   pageSize: 20,
   totalPages,
});

const Harness = ({
   getAllCampaigns,
   navigate = vi.fn(),
   locationState = null,
}: {
   getAllCampaigns: ReturnType<typeof vi.fn<TGetAll>>;
   navigate?: ReturnType<typeof vi.fn>;
   locationState?: unknown;
}) => {
   // Service estável entre renders, como o container IoC entrega.
   const [campaignService] = useState(() => ({ getAllCampaigns }) as unknown as ICampaignService);
   const controller = UseCampaignsController({
      campaignService,
      navigate: navigate as unknown as NavigateFunction,
      locationState,
   });
   return <CampaignsView {...controller} />;
};

describe('UseCampaignsController', () => {
   it('lista nome, segmento, localização, estado e data, e abre o detalhe em um clique', async () => {
      // Arrange
      const navigate = vi.fn();
      render(<Harness getAllCampaigns={vi.fn<TGetAll>().mockResolvedValue(page([ID_A, ID_B]))} navigate={navigate} />);

      // Act
      const row = await screen.findByTestId(`campaigns-row-${ID_A}`);
      fireEvent.click(screen.getByTestId(`campaigns-open-${ID_A}`));

      // Assert
      expect(row.textContent).toContain('Campanha 0');
      expect(row.textContent).toContain('Tecnologia');
      expect(row.textContent).toContain('SP, 3 cidades');
      expect(row.textContent).toContain('Em execução');
      expect(row.textContent).toContain('02/11/2026');
      expect(screen.getByTestId(`campaigns-row-${ID_B}`).textContent).toContain('Rascunho');
      expect(navigate).toHaveBeenCalledWith(buildCampaignDetailPath(ID_A));
   });

   it('clicar no nome da campanha também abre o detalhe', async () => {
      // Arrange
      const navigate = vi.fn();
      render(<Harness getAllCampaigns={vi.fn<TGetAll>().mockResolvedValue(page([ID_A]))} navigate={navigate} />);

      // Act
      fireEvent.click(await screen.findByTestId(`campaigns-name-${ID_A}`));

      // Assert
      expect(navigate).toHaveBeenCalledWith(buildCampaignDetailPath(ID_A));
   });

   it('lista vazia mostra a ação Criar a primeira campanha', async () => {
      // Arrange
      const navigate = vi.fn();
      render(<Harness getAllCampaigns={vi.fn<TGetAll>().mockResolvedValue(page([]))} navigate={navigate} />);

      // Act
      fireEvent.click(await screen.findByTestId('campaigns-create-first'));

      // Assert
      expect(navigate).toHaveBeenCalledWith(RoutePaths.campaignNew);
   });

   it('mostra a confirmação Campanha salva só quando veio do formulário', async () => {
      // Act
      const { unmount } = render(
         <Harness
            getAllCampaigns={vi.fn<TGetAll>().mockResolvedValue(page([ID_A]))}
            locationState={{ campaignCreated: true }}
         />,
      );
      await screen.findByTestId(`campaigns-row-${ID_A}`);

      // Assert
      expect(screen.getByTestId('campaigns-created-notice').textContent).toBe('Campanha salva.');
      unmount();
      render(<Harness getAllCampaigns={vi.fn<TGetAll>().mockResolvedValue(page([ID_A]))} />);
      await screen.findByTestId(`campaigns-row-${ID_A}`);
      expect(screen.queryByTestId('campaigns-created-notice')).toBeNull();
   });

   it.each([[{ campaignCreated: 'true' }], [{ outro: true }], ['texto'], [undefined]])(
      'state de navegação fora do formato esperado (%j) não mostra a confirmação',
      async (locationState) => {
         // Act
         render(
            <Harness
               getAllCampaigns={vi.fn<TGetAll>().mockResolvedValue(page([ID_A]))}
               locationState={locationState}
            />,
         );
         await screen.findByTestId(`campaigns-row-${ID_A}`);

         // Assert
         expect(screen.queryByTestId('campaigns-created-notice')).toBeNull();
      },
   );

   it('filtro por estado reinicia a lista, cancela a requisição em andamento e envia o status', async () => {
      // Arrange
      const signals: AbortSignal[] = [];
      const getAllCampaigns = vi.fn<TGetAll>((request, options) => {
         if (options?.signal) signals.push(options.signal);
         if (request.status === ECampaignStatus.Paused) return Promise.resolve(page([ID_B]));
         return new Promise<TCampaignListResponse>(() => undefined);
      });
      render(<Harness getAllCampaigns={getAllCampaigns} />);
      await waitFor(() => expect(getAllCampaigns).toHaveBeenCalledTimes(1));

      // Act
      fireEvent.change(screen.getByTestId('campaigns-status'), { target: { value: ECampaignStatus.Paused } });

      // Assert
      await screen.findByTestId(`campaigns-row-${ID_B}`);
      expect(signals[0]?.aborted).toBe(true);
      expect(getAllCampaigns.mock.calls[1]?.[0]).toMatchObject({ status: ECampaignStatus.Paused, pageNumber: 1 });
      expect(getAllCampaigns.mock.calls[0]?.[0]).not.toHaveProperty('status');
   });

   it('filtro sem resultado mostra mensagem própria, sem o convite de criar a primeira', async () => {
      // Arrange
      const getAllCampaigns = vi
         .fn<TGetAll>()
         .mockResolvedValueOnce(page([ID_A]))
         .mockResolvedValue(page([]));
      render(<Harness getAllCampaigns={getAllCampaigns} />);
      await screen.findByTestId(`campaigns-row-${ID_A}`);

      // Act
      fireEvent.change(screen.getByTestId('campaigns-status'), { target: { value: ECampaignStatus.Cancelled } });

      // Assert
      expect(await screen.findByTestId('campaigns-filtered-empty')).toBeTruthy();
      expect(screen.queryByTestId('campaigns-empty')).toBeNull();
   });

   it('erro na primeira página mostra mensagem genérica e tenta de novo', async () => {
      // Arrange
      const getAllCampaigns = vi
         .fn<TGetAll>()
         .mockRejectedValueOnce(new AxiosError('Network Error'))
         .mockResolvedValueOnce(page([ID_A]));
      render(<Harness getAllCampaigns={getAllCampaigns} />);
      expect((await screen.findByTestId('campaigns-error')).textContent).toBe(
         'Não foi possível carregar as campanhas. Tente novamente.',
      );

      // Act
      fireEvent.click(screen.getByTestId('campaigns-retry'));

      // Assert
      expect(await screen.findByTestId(`campaigns-row-${ID_A}`)).toBeTruthy();
      expect(screen.queryByTestId('campaigns-error')).toBeNull();
   });

   it('erro na página 2 preserva os itens já carregados e permite tentar de novo', async () => {
      // Arrange
      let notifyVisible: () => void = () => undefined;
      vi.stubGlobal(
         'IntersectionObserver',
         class {
            constructor(handler: (entries: { isIntersecting: boolean }[]) => void) {
               notifyVisible = () => handler([{ isIntersecting: true }]);
            }
            observe = vi.fn();
            disconnect = vi.fn();
         },
      );
      const getAllCampaigns = vi
         .fn<TGetAll>()
         .mockResolvedValueOnce(page([ID_A], 2))
         .mockRejectedValueOnce(new AxiosError('Network Error'))
         .mockResolvedValueOnce(page([ID_B], 2));
      render(<Harness getAllCampaigns={getAllCampaigns} />);
      await screen.findByTestId(`campaigns-row-${ID_A}`);

      // Act
      await act(async () => notifyVisible());
      await screen.findByTestId('campaigns-error');

      // Assert
      expect(screen.getByTestId(`campaigns-row-${ID_A}`)).toBeTruthy();
      fireEvent.click(screen.getByTestId('campaigns-retry'));
      expect(await screen.findByTestId(`campaigns-row-${ID_B}`)).toBeTruthy();
      expect(getAllCampaigns.mock.calls[2]?.[0]).toMatchObject({ pageNumber: 2 });
      vi.unstubAllGlobals();
   });

   it('Nova campanha leva ao formulário', async () => {
      // Arrange
      const navigate = vi.fn();
      render(<Harness getAllCampaigns={vi.fn<TGetAll>().mockResolvedValue(page([ID_A]))} navigate={navigate} />);
      await screen.findByTestId(`campaigns-row-${ID_A}`);

      // Act
      fireEvent.click(screen.getByTestId('campaigns-new'));

      // Assert
      expect(navigate).toHaveBeenCalledWith(RoutePaths.campaignNew);
   });
});
