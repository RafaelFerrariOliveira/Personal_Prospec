import { fireEvent, render, screen } from '@testing-library/react';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import UseCampaignHistoryController from '@components/campaignHistory/campaignHistory.controller';
import CampaignHistoryView from '@components/campaignHistory/campaignHistory.view';
import type { ICampaignService } from '@interfaces/campaign.interface';
import type { TCampaignEventListResponse } from '@response/campaignEvent.response';

type TGetHistory = ICampaignService['getCampaignHistory'];

const ID = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';

const page = (types: string[]): TCampaignEventListResponse => ({
   items: types.map((type, index) => ({
      type,
      description: `Descrição ${index}`,
      occurredAt: `2026-11-02T1${index}:00:00Z`,
   })),
   totalCount: types.length,
   pageNumber: 1,
   pageSize: 20,
   totalPages: 1,
});

const Harness = ({
   getCampaignHistory,
   refreshKey,
}: {
   getCampaignHistory: ReturnType<typeof vi.fn<TGetHistory>>;
   refreshKey: string;
}) => {
   // Service estável entre renders, como o container IoC entrega.
   const [campaignService] = useState(() => ({ getCampaignHistory }) as unknown as ICampaignService);
   const controller = UseCampaignHistoryController({ campaignService, campaignId: ID, refreshKey });
   return <CampaignHistoryView {...controller} />;
};

describe('UseCampaignHistoryController', () => {
   it('lista os eventos com título em pt-BR, descrição e data', async () => {
      // Arrange
      const getCampaignHistory = vi.fn<TGetHistory>().mockResolvedValue(page(['CampaignPaused', 'TipoNovo']));

      // Act
      render(<Harness getCampaignHistory={getCampaignHistory} refreshKey="a" />);

      // Assert
      const list = await screen.findByTestId('campaign-history-list');
      expect(list.textContent).toContain('Campanha pausada');
      expect(list.textContent).toContain('TipoNovo');
      expect(list.textContent).toContain('Descrição 0');
      expect(getCampaignHistory.mock.calls[0]?.[0]).toMatchObject({ id: ID, pageNumber: 1 });
   });

   it('histórico vazio mostra a mensagem de vazio', async () => {
      // Act
      render(<Harness getCampaignHistory={vi.fn<TGetHistory>().mockResolvedValue(page([]))} refreshKey="a" />);

      // Assert
      expect(await screen.findByTestId('campaign-history-empty')).toBeTruthy();
   });

   it('mudar a chave de atualização recarrega o histórico e cancela a requisição anterior', async () => {
      // Arrange
      const signals: AbortSignal[] = [];
      const getCampaignHistory = vi.fn<TGetHistory>((_request, options) => {
         if (options?.signal) signals.push(options.signal);
         return signals.length === 1
            ? new Promise<TCampaignEventListResponse>(() => undefined)
            : Promise.resolve(page(['CampaignStarted']));
      });
      const { rerender } = render(<Harness getCampaignHistory={getCampaignHistory} refreshKey="a" />);

      // Act
      rerender(<Harness getCampaignHistory={getCampaignHistory} refreshKey="b" />);

      // Assert
      expect(await screen.findByText('Campanha iniciada')).toBeTruthy();
      expect(signals[0]?.aborted).toBe(true);
   });

   it('erro mostra mensagem genérica e tenta de novo', async () => {
      // Arrange
      const getCampaignHistory = vi
         .fn<TGetHistory>()
         .mockRejectedValueOnce(new AxiosError('Network Error'))
         .mockResolvedValueOnce(page(['CampaignCreated']));
      render(<Harness getCampaignHistory={getCampaignHistory} refreshKey="a" />);
      expect((await screen.findByTestId('campaign-history-error')).textContent).toBe(
         'Não foi possível carregar o histórico. Tente novamente.',
      );

      // Act
      fireEvent.click(screen.getByTestId('campaign-history-retry'));

      // Assert
      expect(await screen.findByText('Campanha criada')).toBeTruthy();
   });
});
