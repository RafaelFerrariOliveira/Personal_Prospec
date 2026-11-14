import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ECampaignStatus } from '@enums/campaignStatus.enum';
import type { ICampaignService } from '@interfaces/campaign.interface';
import UseCampaignDetailController from '@pages/CampaignDetail/CampaignDetail.controller';
import CampaignDetailView from '@pages/CampaignDetail/CampaignDetail.view';
import type { TCampaignDetailResponse } from '@response/campaignDetail.response';
import { RoutePaths } from '@routes/routePaths';

// Os filhos com Service próprio têm testes à parte; aqui entram como fronteira.
vi.mock('@components/campaignActions/CampaignActions', () => ({
   default: ({ status, onChanged }: { status: string; onChanged: () => void }) => (
      <button type="button" data-testid="stub-actions" data-status={status} onClick={onChanged} />
   ),
}));

vi.mock('@components/campaignHistory/CampaignHistory', () => ({
   default: ({ refreshKey }: { refreshKey: string }) => <div data-testid="stub-history" data-refresh={refreshKey} />,
}));

const ID = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';

const detail = (overrides: Partial<TCampaignDetailResponse> = {}): TCampaignDetailResponse => ({
   id: ID,
   name: 'Campanha de software',
   objective: 'Prospectar',
   idealProfile: null,
   segment: 'Tecnologia',
   services: 'Consultoria',
   differentials: null,
   valueProposition: null,
   targetLeadCount: 50,
   locations: [{ state: 'SP', municipalityCode: '7107', municipalityName: 'SAO PAULO' }],
   cnaes: [{ code: '6201501', description: 'Software' }],
   status: ECampaignStatus.Draft,
   createdAt: '2026-11-02T10:00:00Z',
   updatedAt: '2026-11-02T10:00:00Z',
   progress: null,
   ...overrides,
});

const Harness = ({
   getCampaignById,
   navigate = vi.fn(),
   campaignId = ID,
}: {
   getCampaignById: ReturnType<typeof vi.fn>;
   navigate?: ReturnType<typeof vi.fn>;
   campaignId?: string | undefined;
}) => {
   // Service estável entre renders, como o container IoC entrega.
   const [campaignService] = useState(() => ({ getCampaignById }) as unknown as ICampaignService);
   const controller = UseCampaignDetailController({
      campaignService,
      navigate: navigate as unknown as NavigateFunction,
      campaignId,
   });
   return <CampaignDetailView {...controller} />;
};

describe('UseCampaignDetailController', () => {
   it('mostra a configuração completa, o estado e o texto de pesquisa não executada', async () => {
      // Arrange
      const getCampaignById = vi.fn().mockResolvedValue(detail());

      // Act
      render(<Harness getCampaignById={getCampaignById} />);

      // Assert
      expect((await screen.findByTestId('campaign-detail-name')).textContent).toBe('Campanha de software');
      const items = screen.getByTestId('campaign-detail-items').textContent ?? '';
      expect(screen.getByTestId('campaign-detail-location').textContent).toBe('SP: Sao Paulo');
      expect(screen.getByTestId('campaign-detail-segment').textContent).toBe('Tecnologia');
      expect(screen.getByTestId('campaign-detail-objective').textContent).toBe('Prospectar');
      expect(screen.getByTestId('campaign-detail-meta').textContent).toContain('Criada em 02/11/2026');
      expect(items).toContain('6201501 Software');
      expect(items).toContain('Consultoria');
      expect(items).toContain('Não informado');
      expect(items).toContain('50');
      expect(screen.getByTestId('status-badge').textContent).toBe('Rascunho');
      expect(screen.getByTestId('campaign-detail-progress').textContent).toBe('A pesquisa ainda não foi executada');
      expect(screen.getByText('Meta da campanha: 50 leads')).toBeTruthy();
      expect(getCampaignById.mock.calls[0]?.[0]).toBe(ID);
   });

   it('mostra os contadores só quando a API devolve progress', async () => {
      // Arrange
      const progress = { found: 10, qualified: 4, pending: 6, target: 50 };

      // Act
      render(<Harness getCampaignById={vi.fn().mockResolvedValue(detail({ progress }))} />);

      // Assert
      expect((await screen.findByTestId('campaign-detail-progress')).textContent).toBe(
         'Encontradas: 10. Qualificadas: 4. Pendentes: 6. Meta: 50.',
      );
   });

   it('campanha inexistente ou de outra unidade (null) mostra Campanha não encontrada com volta à lista', async () => {
      // Arrange
      const navigate = vi.fn();
      render(<Harness getCampaignById={vi.fn().mockResolvedValue(null)} navigate={navigate} />);

      // Act
      fireEvent.click(await screen.findByTestId('campaign-detail-back'));

      // Assert
      expect(screen.getByTestId('campaign-detail-not-found').textContent).toContain('Campanha não encontrada.');
      expect(navigate).toHaveBeenCalledWith(RoutePaths.campaigns);
   });

   it('sem id na rota mostra não encontrada e não chama o Service', async () => {
      // Arrange
      const getCampaignById = vi.fn();

      // Act
      render(<Harness getCampaignById={getCampaignById} campaignId="" />);

      // Assert
      expect(await screen.findByTestId('campaign-detail-not-found')).toBeTruthy();
      expect(getCampaignById).not.toHaveBeenCalled();
   });

   it('erro de rede mostra mensagem genérica e permite tentar de novo', async () => {
      // Arrange
      const getCampaignById = vi
         .fn()
         .mockRejectedValueOnce(new AxiosError('Network Error'))
         .mockResolvedValueOnce(detail());
      render(<Harness getCampaignById={getCampaignById} />);
      expect((await screen.findByTestId('campaign-detail-errors')).textContent).toBe(
         'Não foi possível carregar a campanha. Tente novamente em instantes.',
      );

      // Act
      fireEvent.click(screen.getByTestId('campaign-detail-retry'));

      // Assert
      expect(await screen.findByTestId('campaign-detail-name')).toBeTruthy();
      expect(getCampaignById).toHaveBeenCalledTimes(2);
   });

   it('depois de uma ação, recarrega o detalhe e atualiza o estado exibido e a chave do histórico', async () => {
      // Arrange
      const getCampaignById = vi
         .fn()
         .mockResolvedValueOnce(detail({ status: ECampaignStatus.Running }))
         .mockResolvedValueOnce(detail({ status: ECampaignStatus.Paused, updatedAt: '2026-11-02T11:00:00Z' }));
      render(<Harness getCampaignById={getCampaignById} />);
      await screen.findByTestId('stub-actions');
      const firstKey = screen.getByTestId('stub-history').getAttribute('data-refresh');

      // Act
      fireEvent.click(screen.getByTestId('stub-actions'));

      // Assert
      await waitFor(() => expect(screen.getByTestId('status-badge').textContent).toBe('Pausada'));
      expect(screen.getByTestId('stub-history').getAttribute('data-refresh')).not.toBe(firstKey);
      expect(screen.getByTestId('stub-actions').getAttribute('data-status')).toBe(ECampaignStatus.Paused);
   });

   it('cancela a requisição ao sair da página', async () => {
      // Arrange
      let captured: AbortSignal | undefined;
      const getCampaignById = vi.fn((_id: string, options?: { signal?: AbortSignal }) => {
         captured = options?.signal;
         return new Promise(() => undefined);
      });
      const { unmount } = render(<Harness getCampaignById={getCampaignById} />);

      // Act
      unmount();

      // Assert
      expect(captured?.aborted).toBe(true);
   });
});
