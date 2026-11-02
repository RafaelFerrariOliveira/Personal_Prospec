import { act, fireEvent, render, screen } from '@testing-library/react';
import { AxiosError } from 'axios';
import { useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ECampaignStatus } from '@enums/campaignStatus.enum';
import type { ICampaignService } from '@interfaces/campaign.interface';
import UseCampaignStartedController from '@pages/CampaignStarted/CampaignStarted.controller';
import CampaignStartedView from '@pages/CampaignStarted/CampaignStarted.view';
import type { TCampaignDetailResponse } from '@response/campaignDetail.response';
import { buildCampaignDetailPath, RoutePaths } from '@routes/routePaths';

const ID = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';

const detail: TCampaignDetailResponse = {
   id: ID,
   name: 'Campanha de software',
   objective: 'Prospectar',
   idealProfile: null,
   segment: 'Tecnologia',
   services: null,
   differentials: null,
   valueProposition: null,
   targetLeadCount: 50,
   locations: [
      { state: 'SP', municipalityCode: '7107', municipalityName: 'SAO PAULO' },
      { state: 'SP', municipalityCode: '6291', municipalityName: 'CAMPINAS' },
   ],
   cnaes: [{ code: '6201501', description: 'Software' }],
   status: ECampaignStatus.Running,
   createdAt: '2026-11-02T10:00:00Z',
   updatedAt: '2026-11-02T10:00:00Z',
   progress: null,
};

const Harness = ({
   getCampaignById,
   navigate,
}: {
   getCampaignById: ReturnType<typeof vi.fn>;
   navigate: ReturnType<typeof vi.fn>;
}) => {
   // Service estável entre renders, como o container IoC entrega.
   const [campaignService] = useState(() => ({ getCampaignById }) as unknown as ICampaignService);
   const controller = UseCampaignStartedController({
      campaignService,
      navigate: navigate as unknown as NavigateFunction,
      campaignId: ID,
   });
   return <CampaignStartedView {...controller} />;
};

const flush = async (ms = 0): Promise<void> => {
   await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
   });
};

describe('UseCampaignStartedController', () => {
   beforeEach(() => {
      vi.useFakeTimers();
   });

   afterEach(() => {
      vi.useRealTimers();
   });

   it('mostra nome, meta e localização da campanha iniciada', async () => {
      // Arrange
      render(<Harness getCampaignById={vi.fn().mockResolvedValue(detail)} navigate={vi.fn()} />);

      // Act
      await flush();

      // Assert
      expect(screen.getByText('Agente de IA iniciado')).toBeTruthy();
      expect(screen.getByTestId('campaign-started-name').textContent).toContain('Campanha de software');
      expect(screen.getByTestId('campaign-started-target').textContent).toContain('50');
      expect(screen.getByTestId('campaign-started-location').textContent).toContain('SP: SAO PAULO, CAMPINAS');
   });

   it('redireciona ao detalhe depois de 3 segundos, não antes', async () => {
      // Arrange
      const navigate = vi.fn();
      render(<Harness getCampaignById={vi.fn().mockResolvedValue(detail)} navigate={navigate} />);
      await flush();

      // Act
      await flush(2999);
      expect(navigate).not.toHaveBeenCalled();
      await flush(1);

      // Assert
      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith(buildCampaignDetailPath(ID), { replace: true });
   });

   it('limpa o temporizador ao desmontar: não redireciona depois de sair da página', async () => {
      // Arrange
      const navigate = vi.fn();
      const { unmount } = render(<Harness getCampaignById={vi.fn().mockResolvedValue(detail)} navigate={navigate} />);
      await flush();

      // Act
      unmount();
      await flush(5000);

      // Assert
      expect(navigate).not.toHaveBeenCalled();
   });

   it('o atalho leva ao detalhe na hora', async () => {
      // Arrange
      const navigate = vi.fn();
      render(<Harness getCampaignById={vi.fn().mockResolvedValue(detail)} navigate={navigate} />);
      await flush();

      // Act
      fireEvent.click(screen.getByTestId('campaign-started-open'));

      // Assert
      expect(navigate).toHaveBeenCalledWith(buildCampaignDetailPath(ID), { replace: true });
   });

   it('campanha não encontrada não redireciona e oferece voltar à lista', async () => {
      // Arrange
      const navigate = vi.fn();
      render(<Harness getCampaignById={vi.fn().mockResolvedValue(null)} navigate={navigate} />);
      await flush();

      // Act
      await flush(5000);
      fireEvent.click(screen.getByTestId('campaign-started-back'));

      // Assert
      expect(screen.getByTestId('campaign-started-not-found')).toBeTruthy();
      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith(RoutePaths.campaigns);
   });

   it('erro ao carregar mostra mensagem e não redireciona', async () => {
      // Arrange
      const navigate = vi.fn();
      render(
         <Harness getCampaignById={vi.fn().mockRejectedValue(new AxiosError('Network Error'))} navigate={navigate} />,
      );

      // Act
      await flush(5000);

      // Assert
      expect(screen.getByTestId('campaign-started-errors').textContent).toBe(
         'Não foi possível carregar a campanha. Tente novamente em instantes.',
      );
      expect(navigate).not.toHaveBeenCalled();
   });
});
