import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@domain/errors/api-error';
import { ECampaignStatus } from '@enums/campaignStatus.enum';
import type { ICampaignService } from '@interfaces/campaign.interface';
import UseCampaignFormController from '@pages/CampaignForm/CampaignForm.controller';
import CampaignFormView from '@pages/CampaignForm/CampaignForm.view';
import type { TCampaignDetailResponse } from '@response/campaignDetail.response';
import { buildCampaignDetailPath, RoutePaths } from '@routes/routePaths';

// Os dois componentes de busca têm testes próprios; aqui entram como fronteira e expõem o que receberam.
vi.mock('@components/municipalityPicker/MunicipalityPicker', () => ({
   default: ({ value, labels }: { value: { municipalityCode: string }[]; labels: Record<string, string> }) => (
      <div data-testid="stub-cities">{value.map((item) => labels[item.municipalityCode]).join(',')}</div>
   ),
}));

vi.mock('@components/cnaeSearchInput/CnaeSearchInput', () => ({
   default: ({ value, labels }: { value: string[]; labels: Record<string, string> }) => (
      <div data-testid="stub-cnae">{value.map((code) => labels[code]).join(',')}</div>
   ),
}));

const ID = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';

const detail = (status: ECampaignStatus): TCampaignDetailResponse => ({
   id: ID,
   name: 'Campanha existente',
   objective: 'Objetivo existente',
   idealProfile: null,
   segment: 'Tecnologia',
   services: 'Consultoria',
   differentials: null,
   valueProposition: null,
   targetLeadCount: 40,
   locations: [{ state: 'SP', municipalityCode: '7107', municipalityName: 'SAO PAULO' }],
   cnaes: [{ code: '6201501', description: 'Software sob encomenda' }],
   status,
   createdAt: '2026-11-02T10:00:00Z',
   updatedAt: '2026-11-02T10:00:00Z',
   progress: null,
});

type TFakes = {
   getCampaignById: ReturnType<typeof vi.fn>;
   updateCampaign: ReturnType<typeof vi.fn>;
   createCampaign: ReturnType<typeof vi.fn>;
   navigate: ReturnType<typeof vi.fn>;
};

const createFakes = (status: ECampaignStatus | null): TFakes => ({
   getCampaignById: vi.fn().mockResolvedValue(status ? detail(status) : null),
   updateCampaign: vi.fn().mockResolvedValue(true),
   createCampaign: vi.fn(),
   navigate: vi.fn(),
});

const Harness = ({ fakes }: { fakes: TFakes }) => {
   // Service estável entre renders, como o container IoC entrega.
   const [campaignService] = useState(
      () =>
         ({
            getCampaignById: fakes.getCampaignById,
            updateCampaign: fakes.updateCampaign,
            createCampaign: fakes.createCampaign,
         }) as unknown as ICampaignService,
   );
   const controller = UseCampaignFormController({
      campaignService,
      navigate: fakes.navigate as unknown as NavigateFunction,
      generateId: () => 'aaaaaaaa-5a4d-4e6f-9b7a-1c2d3e4f5a6b',
      campaignId: ID,
   });
   return <CampaignFormView {...controller} />;
};

const next = async (expectedTestId: string): Promise<void> => {
   fireEvent.click(screen.getByTestId('campaign-next'));
   await screen.findByTestId(expectedTestId);
};

const goToSummary = async (): Promise<void> => {
   const name = (await screen.findByTestId('campaign-name')) as HTMLInputElement;
   await waitFor(() => expect(name.value).toBe('Campanha existente'));
   await next('stub-cities');
   await next('campaign-segment');
   await next('campaign-services');
   await next('campaign-target-lead-count');
   await next('campaign-summary');
};

describe('UseCampaignFormController: modo edição', () => {
   it('carrega a campanha, preenche o formulário e usa os nomes do detalhe nos seletores', async () => {
      // Arrange
      const fakes = createFakes(ECampaignStatus.Draft);
      render(<Harness fakes={fakes} />);

      // Act
      const name = (await screen.findByTestId('campaign-name')) as HTMLInputElement;
      await waitFor(() => expect(name.value).toBe('Campanha existente'));
      await next('stub-cities');

      // Assert
      expect(screen.getByText('Editar campanha')).toBeTruthy();
      expect(screen.getByTestId('stub-cities').textContent).toBe('SAO PAULO');
      expect(fakes.getCampaignById.mock.calls[0]?.[0]).toBe(ID);
   });

   it('salva por updateCampaign com o id, sem requestId, e volta ao detalhe', async () => {
      // Arrange
      const fakes = createFakes(ECampaignStatus.Paused);
      render(<Harness fakes={fakes} />);
      await goToSummary();
      expect(screen.getByTestId('campaign-summary').textContent).toContain('6201501 Software sob encomenda');

      // Act
      fireEvent.click(screen.getByTestId('campaign-save'));

      // Assert
      await waitFor(() => expect(fakes.navigate).toHaveBeenCalledWith(buildCampaignDetailPath(ID)));
      expect(fakes.createCampaign).not.toHaveBeenCalled();
      expect(fakes.updateCampaign).toHaveBeenCalledTimes(1);
      const sent = fakes.updateCampaign.mock.calls[0]?.[0];
      expect(sent).toEqual({
         id: ID,
         name: 'Campanha existente',
         objective: 'Objetivo existente',
         idealProfile: '',
         segment: 'Tecnologia',
         services: 'Consultoria',
         differentials: '',
         valueProposition: '',
         targetLeadCount: 40,
         locations: [{ state: 'SP', municipalityCode: '7107' }],
         cnaeCodes: ['6201501'],
      });
   });

   it.each([ECampaignStatus.Running, ECampaignStatus.Completed, ECampaignStatus.Cancelled])(
      'estado %s bloqueia a edição com a orientação de pausar antes',
      async (status) => {
         // Arrange
         const fakes = createFakes(status);

         // Act
         render(<Harness fakes={fakes} />);

         // Assert
         expect((await screen.findByTestId('campaign-form-blocked')).textContent).toBe(
            'Só é possível editar em Rascunho ou Pausada. Pause a campanha antes de editar.',
         );
         expect(screen.queryByTestId('campaign-name')).toBeNull();
      },
   );

   it('campanha inexistente ou de outra unidade mostra não encontrada e volta à lista', async () => {
      // Arrange
      const fakes = createFakes(null);
      render(<Harness fakes={fakes} />);

      // Act
      fireEvent.click(await screen.findByTestId('campaign-form-back-to-list'));

      // Assert
      expect(screen.getByTestId('campaign-form-not-found').textContent).toBe('Campanha não encontrada.');
      expect(fakes.navigate).toHaveBeenCalledWith(RoutePaths.campaigns);
   });

   it('erro 400 ao salvar mostra a mensagem do backend e mantém os dados', async () => {
      // Arrange
      const fakes = createFakes(ECampaignStatus.Draft);
      fakes.updateCampaign.mockRejectedValueOnce(
         new ApiError(['A campanha está Em execução. Só é possível alterar em Rascunho ou Pausada; pause antes.'], 400),
      );
      render(<Harness fakes={fakes} />);
      await goToSummary();

      // Act
      fireEvent.click(screen.getByTestId('campaign-save'));

      // Assert
      expect((await screen.findByTestId('campaign-submit-errors')).textContent).toContain('pause antes');
      expect(fakes.navigate).not.toHaveBeenCalled();
      expect(screen.getByTestId('campaign-summary').textContent).toContain('Campanha existente');
   });

   it('erro de rede ao carregar mostra mensagem genérica em vez de ficar carregando', async () => {
      // Arrange
      const fakes = createFakes(ECampaignStatus.Draft);
      fakes.getCampaignById.mockRejectedValueOnce(new Error('Network Error'));

      // Act
      render(<Harness fakes={fakes} />);

      // Assert
      expect((await screen.findByTestId('campaign-form-load-errors')).textContent).toBe(
         'Não foi possível carregar a campanha. Tente novamente em instantes.',
      );
   });
});
