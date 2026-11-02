import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { AxiosError, type AxiosResponse } from 'axios';
import type { NavigateFunction } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import UseCampaignActionsController from '@components/campaignActions/campaignActions.controller';
import CampaignActionsView from '@components/campaignActions/campaignActions.view';
import { ApiError } from '@domain/errors/api-error';
import { ECampaignStatus } from '@enums/campaignStatus.enum';
import type { ICampaignService } from '@interfaces/campaign.interface';
import { buildCampaignEditPath, buildCampaignStartedPath } from '@routes/routePaths';

const ID = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';

type TFakes = {
   service: Record<'startCampaign' | 'pauseCampaign' | 'resumeCampaign' | 'cancelCampaign', ReturnType<typeof vi.fn>>;
   navigate: ReturnType<typeof vi.fn>;
   onChanged: ReturnType<typeof vi.fn>;
};

const createFakes = (): TFakes => ({
   service: {
      startCampaign: vi.fn().mockResolvedValue(true),
      pauseCampaign: vi.fn().mockResolvedValue(true),
      resumeCampaign: vi.fn().mockResolvedValue(true),
      cancelCampaign: vi.fn().mockResolvedValue(true),
   },
   navigate: vi.fn(),
   onChanged: vi.fn(),
});

const Harness = ({ status, fakes }: { status: ECampaignStatus; fakes: TFakes }) => {
   const controller = UseCampaignActionsController({
      campaignId: ID,
      status,
      onChanged: fakes.onChanged as unknown as () => void,
      campaignService: fakes.service as unknown as ICampaignService,
      navigate: fakes.navigate as unknown as NavigateFunction,
   });
   return <CampaignActionsView {...controller} />;
};

const has = (testId: string): boolean => screen.queryByTestId(testId) !== null;
const isDisabled = (testId: string): boolean => (screen.getByTestId(testId) as HTMLButtonElement).disabled;

describe('UseCampaignActionsController: matriz estado x ação', () => {
   it.each([
      [ECampaignStatus.Draft, { start: true, pause: false, resume: false, cancel: true, edit: true }],
      [ECampaignStatus.Running, { start: false, pause: true, resume: false, cancel: true, edit: false }],
      [ECampaignStatus.Paused, { start: false, pause: false, resume: true, cancel: true, edit: true }],
      [ECampaignStatus.Completed, { start: false, pause: false, resume: false, cancel: false, edit: false }],
      [ECampaignStatus.Cancelled, { start: false, pause: false, resume: false, cancel: false, edit: false }],
   ])('estado %s mostra só as ações permitidas', (status, expected) => {
      // Act
      render(<Harness status={status} fakes={createFakes()} />);

      // Assert
      expect(has('campaign-action-start')).toBe(expected.start);
      expect(has('campaign-action-pause')).toBe(expected.pause);
      expect(has('campaign-action-resume')).toBe(expected.resume);
      expect(has('campaign-action-cancel')).toBe(expected.cancel);
      expect(isDisabled('campaign-action-edit')).toBe(!expected.edit);
   });

   it('em execução explica que é preciso pausar antes de editar', () => {
      // Act
      render(<Harness status={ECampaignStatus.Running} fakes={createFakes()} />);

      // Assert
      expect(screen.getByTestId('campaign-action-edit-hint').textContent).toContain('Pause a campanha antes de editar');
   });

   it('rascunho não mostra a dica de edição', () => {
      // Act
      render(<Harness status={ECampaignStatus.Draft} fakes={createFakes()} />);

      // Assert
      expect(has('campaign-action-edit-hint')).toBe(false);
   });
});

describe('UseCampaignActionsController: ações', () => {
   it('iniciar chama o Service e leva à tela Agente de IA iniciado', async () => {
      // Arrange
      const fakes = createFakes();
      render(<Harness status={ECampaignStatus.Draft} fakes={fakes} />);

      // Act
      fireEvent.click(screen.getByTestId('campaign-action-start'));

      // Assert
      await waitFor(() => expect(fakes.navigate).toHaveBeenCalledWith(buildCampaignStartedPath(ID)));
      expect(fakes.service.startCampaign).toHaveBeenCalledWith(ID);
   });

   it('pausar e retomar chamam o Service e pedem a recarga do detalhe', async () => {
      // Arrange
      const fakes = createFakes();
      const pause = render(<Harness status={ECampaignStatus.Running} fakes={fakes} />);

      // Act
      fireEvent.click(screen.getByTestId('campaign-action-pause'));
      await waitFor(() => expect(fakes.onChanged).toHaveBeenCalledTimes(1));
      pause.unmount();
      render(<Harness status={ECampaignStatus.Paused} fakes={fakes} />);
      fireEvent.click(screen.getByTestId('campaign-action-resume'));
      await waitFor(() => expect(fakes.onChanged).toHaveBeenCalledTimes(2));

      // Assert
      expect(fakes.service.pauseCampaign).toHaveBeenCalledWith(ID);
      expect(fakes.service.resumeCampaign).toHaveBeenCalledWith(ID);
   });

   it('editar leva à tela de edição', () => {
      // Arrange
      const fakes = createFakes();
      render(<Harness status={ECampaignStatus.Paused} fakes={fakes} />);

      // Act
      fireEvent.click(screen.getByTestId('campaign-action-edit'));

      // Assert
      expect(fakes.navigate).toHaveBeenCalledWith(buildCampaignEditPath(ID));
   });

   it('cancelar exige confirmação e não chama o Service antes dela', () => {
      // Arrange
      const fakes = createFakes();
      render(<Harness status={ECampaignStatus.Running} fakes={fakes} />);

      // Act
      fireEvent.click(screen.getByTestId('campaign-action-cancel'));

      // Assert
      expect(has('campaign-cancel-confirm')).toBe(true);
      expect(fakes.service.cancelCampaign).not.toHaveBeenCalled();
   });

   it('voltar na confirmação fecha o aviso sem cancelar', () => {
      // Arrange
      const fakes = createFakes();
      render(<Harness status={ECampaignStatus.Running} fakes={fakes} />);
      fireEvent.click(screen.getByTestId('campaign-action-cancel'));

      // Act
      fireEvent.click(screen.getByTestId('campaign-cancel-confirm-no'));

      // Assert
      expect(has('campaign-cancel-confirm')).toBe(false);
      expect(fakes.service.cancelCampaign).not.toHaveBeenCalled();
   });

   it('confirmar o cancelamento chama o Service e pede a recarga', async () => {
      // Arrange
      const fakes = createFakes();
      render(<Harness status={ECampaignStatus.Paused} fakes={fakes} />);
      fireEvent.click(screen.getByTestId('campaign-action-cancel'));

      // Act
      fireEvent.click(screen.getByTestId('campaign-cancel-confirm-yes'));

      // Assert
      await waitFor(() => expect(fakes.onChanged).toHaveBeenCalledTimes(1));
      expect(fakes.service.cancelCampaign).toHaveBeenCalledWith(ID);
      expect(has('campaign-cancel-confirm')).toBe(false);
   });

   it('duplo clique em Pausar gera uma única chamada e desabilita os botões durante a chamada', async () => {
      // Arrange
      let release: (value: boolean) => void = () => undefined;
      const fakes = createFakes();
      fakes.service.pauseCampaign.mockReturnValue(new Promise<boolean>((resolve) => (release = resolve)));
      render(<Harness status={ECampaignStatus.Running} fakes={fakes} />);

      // Act
      fireEvent.click(screen.getByTestId('campaign-action-pause'));
      fireEvent.click(screen.getByTestId('campaign-action-pause'));
      await waitFor(() => expect(isDisabled('campaign-action-pause')).toBe(true));
      release(true);

      // Assert
      await waitFor(() => expect(fakes.onChanged).toHaveBeenCalledTimes(1));
      expect(fakes.service.pauseCampaign).toHaveBeenCalledTimes(1);
   });
});

describe('UseCampaignActionsController: erros', () => {
   it('400 mostra a mensagem do backend (ex.: transição inválida) e libera os botões', async () => {
      // Arrange
      const fakes = createFakes();
      fakes.service.pauseCampaign.mockRejectedValueOnce(
         new ApiError(['A campanha está Pausada e não pode ser Pausada.'], 400),
      );
      render(<Harness status={ECampaignStatus.Running} fakes={fakes} />);

      // Act
      fireEvent.click(screen.getByTestId('campaign-action-pause'));

      // Assert
      expect((await screen.findByTestId('campaign-actions-errors')).textContent).toBe(
         'A campanha está Pausada e não pode ser Pausada.',
      );
      expect(isDisabled('campaign-action-pause')).toBe(false);
      expect(fakes.onChanged).not.toHaveBeenCalled();
   });

   it('401 mostra sessão expirada', async () => {
      // Arrange
      const fakes = createFakes();
      fakes.service.startCampaign.mockRejectedValueOnce(
         new AxiosError('falha', '401', undefined, null, { status: 401 } as AxiosResponse),
      );
      render(<Harness status={ECampaignStatus.Draft} fakes={fakes} />);

      // Act
      fireEvent.click(screen.getByTestId('campaign-action-start'));

      // Assert
      expect((await screen.findByTestId('campaign-actions-errors')).textContent).toBe(
         'Sua sessão expirou. Entre novamente para continuar.',
      );
   });

   it.each([
      ['500', new AxiosError('falha', '500', undefined, null, { status: 500 } as AxiosResponse)],
      ['erro de rede', new AxiosError('Network Error')],
   ])('%s mostra mensagem genérica e não navega', async (_name, failure) => {
      // Arrange
      const fakes = createFakes();
      fakes.service.startCampaign.mockRejectedValueOnce(failure);
      render(<Harness status={ECampaignStatus.Draft} fakes={fakes} />);

      // Act
      fireEvent.click(screen.getByTestId('campaign-action-start'));

      // Assert
      expect((await screen.findByTestId('campaign-actions-errors')).textContent).toBe(
         'Não foi possível concluir a ação. Tente novamente em instantes.',
      );
      expect(fakes.navigate).not.toHaveBeenCalled();
   });

   it('resposta false da API é tratada como falha', async () => {
      // Arrange
      const fakes = createFakes();
      fakes.service.resumeCampaign.mockResolvedValueOnce(false);
      render(<Harness status={ECampaignStatus.Paused} fakes={fakes} />);

      // Act
      fireEvent.click(screen.getByTestId('campaign-action-resume'));

      // Assert
      expect(await screen.findByTestId('campaign-actions-errors')).toBeTruthy();
      expect(fakes.onChanged).not.toHaveBeenCalled();
   });
});

describe('UseCampaignActionsController: chamadas diretas aos handlers', () => {
   const renderController = (status: ECampaignStatus, fakes: TFakes) =>
      renderHook(() =>
         UseCampaignActionsController({
            campaignId: ID,
            status,
            onChanged: fakes.onChanged as unknown as () => void,
            campaignService: fakes.service as unknown as ICampaignService,
            navigate: fakes.navigate as unknown as NavigateFunction,
         }),
      );

   it.each([ECampaignStatus.Completed, ECampaignStatus.Cancelled])(
      'em %s nenhuma ação chama o Service nem navega, mesmo chamada direto',
      (status) => {
         // Arrange
         const fakes = createFakes();
         const { result } = renderController(status, fakes);

         // Act
         act(() => {
            result.current.onStart();
            result.current.onPause();
            result.current.onResume();
            result.current.onEdit();
            result.current.onRequestCancel();
            result.current.onConfirmCancel();
         });

         // Assert
         expect(Object.values(fakes.service).every((call) => call.mock.calls.length === 0)).toBe(true);
         expect(fakes.navigate).not.toHaveBeenCalled();
         expect(result.current.isConfirmingCancel).toBe(false);
      },
   );

   it('duas chamadas seguidas no mesmo ciclo disparam uma única requisição', async () => {
      // Arrange
      const fakes = createFakes();
      const { result } = renderController(ECampaignStatus.Running, fakes);

      // Act
      await act(async () => {
         result.current.onPause();
         result.current.onPause();
      });

      // Assert
      expect(fakes.service.pauseCampaign).toHaveBeenCalledTimes(1);
      expect(fakes.onChanged).toHaveBeenCalledTimes(1);
   });
});
