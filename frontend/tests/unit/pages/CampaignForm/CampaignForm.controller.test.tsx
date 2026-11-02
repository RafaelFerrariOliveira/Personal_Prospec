import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AxiosError, type AxiosResponse } from 'axios';
import type { NavigateFunction } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ICnaeSearchInputProps } from '@components/cnaeSearchInput/cnaeSearchInput.types';
import type { IMunicipalityPickerProps } from '@components/municipalityPicker/municipalityPicker.types';
import { ApiError } from '@domain/errors/api-error';
import type { ICampaignService } from '@interfaces/campaign.interface';
import UseCampaignFormController from '@pages/CampaignForm/CampaignForm.controller';
import CampaignFormView from '@pages/CampaignForm/CampaignForm.view';
import { RoutePaths } from '@routes/routePaths';

// Os dois componentes de busca têm testes próprios; aqui entram como fronteira, devolvendo uma seleção fixa.
vi.mock('@components/municipalityPicker/MunicipalityPicker', () => ({
   // O erro de validação da etapa chega ao seletor por errorMessage; o stub o expõe para a asserção.
   default: ({ onChange, errorMessage }: IMunicipalityPickerProps) => (
      <>
         <button
            type="button"
            data-testid="stub-pick-city"
            onClick={() => onChange([{ state: 'SP', municipalityCode: '7107' }], { '7107': 'SAO PAULO' })}
         />
         {errorMessage && <span data-testid="campaign-locations-error">{errorMessage}</span>}
      </>
   ),
}));

vi.mock('@components/cnaeSearchInput/CnaeSearchInput', () => ({
   default: ({ onChange }: ICnaeSearchInputProps) => (
      <button
         type="button"
         data-testid="stub-pick-cnae"
         onClick={() => onChange(['6201501'], { '6201501': 'Desenvolvimento de programas' })}
      />
   ),
}));

const REQUEST_ID = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';

type TFakes = { createCampaign: ReturnType<typeof vi.fn>; navigate: ReturnType<typeof vi.fn> };

const Harness = ({ fakes }: { fakes: TFakes }) => {
   const controller = UseCampaignFormController({
      campaignService: { createCampaign: fakes.createCampaign } as unknown as ICampaignService,
      navigate: fakes.navigate as unknown as NavigateFunction,
      generateId: () => REQUEST_ID,
   });
   return <CampaignFormView {...controller} />;
};

const createFakes = (): TFakes => ({
   createCampaign: vi.fn().mockResolvedValue(true),
   navigate: vi.fn(),
});

const type = (testId: string, value: string): void => {
   fireEvent.change(screen.getByTestId(testId), { target: { value } });
};

const next = async (expectedStepTestId: string): Promise<void> => {
   fireEvent.click(screen.getByTestId('campaign-next'));
   await screen.findByTestId(expectedStepTestId);
};

const goToSummary = async (): Promise<void> => {
   type('campaign-name', 'Campanha de software');
   type('campaign-objective', 'Prospectar clientes');
   await next('stub-pick-city');
   fireEvent.click(screen.getByTestId('stub-pick-city'));
   await next('campaign-segment');
   type('campaign-segment', 'Tecnologia');
   fireEvent.click(screen.getByTestId('stub-pick-cnae'));
   await next('campaign-services');
   await next('campaign-target-lead-count');
   type('campaign-target-lead-count', '50');
   await next('campaign-summary');
};

const axiosFailure = (status: number): AxiosError =>
   new AxiosError('falha', String(status), undefined, null, { status } as AxiosResponse);

describe('UseCampaignFormController', () => {
   let fakes: TFakes;

   beforeEach(() => {
      fakes = createFakes();
   });

   it('bloqueia o avanço quando falta campo obrigatório e indica o campo', async () => {
      // Arrange
      render(<Harness fakes={fakes} />);

      // Act
      fireEvent.click(screen.getByTestId('campaign-next'));

      // Assert
      expect((await screen.findByTestId('campaign-name-error')).textContent).toBe('Informe o nome da campanha.');
      expect(screen.getByTestId('campaign-objective-error').textContent).toBe('Informe o objetivo da campanha.');
      expect(screen.queryByTestId('stub-pick-city')).toBeNull();
   });

   it('nome só com espaços não avança', async () => {
      // Arrange
      render(<Harness fakes={fakes} />);
      type('campaign-name', '    ');
      type('campaign-objective', 'Objetivo');

      // Act
      fireEvent.click(screen.getByTestId('campaign-next'));

      // Assert
      expect(await screen.findByTestId('campaign-name-error')).toBeTruthy();
   });

   it('não deixa avançar da localização sem cidade', async () => {
      // Arrange
      render(<Harness fakes={fakes} />);
      type('campaign-name', 'Nome');
      type('campaign-objective', 'Objetivo');
      await next('stub-pick-city');

      // Act
      fireEvent.click(screen.getByTestId('campaign-next'));

      // Assert
      expect((await screen.findByTestId('campaign-locations-error')).textContent).toBe('Escolha ao menos uma cidade.');
   });

   it('voltar mantém os dados digitados', async () => {
      // Arrange
      render(<Harness fakes={fakes} />);
      type('campaign-name', 'Nome mantido');
      type('campaign-objective', 'Objetivo mantido');
      await next('stub-pick-city');

      // Act
      fireEvent.click(screen.getByTestId('campaign-back'));

      // Assert
      expect(((await screen.findByTestId('campaign-name')) as HTMLInputElement).value).toBe('Nome mantido');
      expect((screen.getByTestId('campaign-objective') as HTMLTextAreaElement).value).toBe('Objetivo mantido');
      expect(screen.queryByTestId('campaign-back')).toBeNull();
   });

   it('mostra o resumo com todos os dados antes de salvar, sem chamar o Service', async () => {
      // Arrange
      render(<Harness fakes={fakes} />);

      // Act
      await goToSummary();

      // Assert
      const summary = screen.getByTestId('campaign-summary').textContent ?? '';
      expect(summary).toContain('Campanha de software');
      expect(summary).toContain('SP: SAO PAULO');
      expect(summary).toContain('6201501 Desenvolvimento de programas');
      expect(summary).toContain('50');
      expect(summary).toContain('Não informado');
      expect(fakes.createCampaign).not.toHaveBeenCalled();
   });

   it('quantidade de leads inválida bloqueia o avanço', async () => {
      // Arrange
      render(<Harness fakes={fakes} />);
      type('campaign-name', 'Nome');
      type('campaign-objective', 'Objetivo');
      await next('stub-pick-city');
      fireEvent.click(screen.getByTestId('stub-pick-city'));
      await next('campaign-segment');
      type('campaign-segment', 'Seg');
      fireEvent.click(screen.getByTestId('stub-pick-cnae'));
      await next('campaign-services');
      await next('campaign-target-lead-count');
      type('campaign-target-lead-count', '0');

      // Act
      fireEvent.click(screen.getByTestId('campaign-next'));

      // Assert
      expect((await screen.findByTestId('campaign-target-lead-count-error')).textContent).toBe(
         'A quantidade deve ficar entre 1 e 500.',
      );
   });

   it('salva com o requestId gerado ao abrir e vai para a lista de campanhas', async () => {
      // Arrange
      render(<Harness fakes={fakes} />);
      await goToSummary();

      // Act
      fireEvent.click(screen.getByTestId('campaign-save'));

      // Assert
      await waitFor(() =>
         expect(fakes.navigate).toHaveBeenCalledWith(RoutePaths.campaigns, { state: { campaignCreated: true } }),
      );
      expect(fakes.createCampaign).toHaveBeenCalledTimes(1);
      expect(fakes.createCampaign.mock.calls[0]?.[0]).toEqual({
         requestId: REQUEST_ID,
         name: 'Campanha de software',
         objective: 'Prospectar clientes',
         idealProfile: '',
         segment: 'Tecnologia',
         services: '',
         differentials: '',
         valueProposition: '',
         targetLeadCount: 50,
         locations: [{ state: 'SP', municipalityCode: '7107' }],
         cnaeCodes: ['6201501'],
      });
   });

   it('duplo clique em Salvar gera uma única chamada', async () => {
      // Arrange
      let release: (value: boolean) => void = () => undefined;
      fakes.createCampaign.mockReturnValue(new Promise<boolean>((resolve) => (release = resolve)));
      render(<Harness fakes={fakes} />);
      await goToSummary();

      // Act
      fireEvent.click(screen.getByTestId('campaign-save'));
      fireEvent.click(screen.getByTestId('campaign-save'));
      await waitFor(() => expect((screen.getByTestId('campaign-save') as HTMLButtonElement).disabled).toBe(true));
      release(true);

      // Assert
      await waitFor(() => expect(fakes.navigate).toHaveBeenCalledTimes(1));
      expect(fakes.createCampaign).toHaveBeenCalledTimes(1);
   });

   it('400 mostra as mensagens da API e mantém os dados e o requestId para reenviar', async () => {
      // Arrange
      fakes.createCampaign.mockRejectedValueOnce(new ApiError(['Já existe uma campanha com esse nome.'], 400));
      render(<Harness fakes={fakes} />);
      await goToSummary();

      // Act
      fireEvent.click(screen.getByTestId('campaign-save'));

      // Assert
      expect((await screen.findByTestId('campaign-submit-errors')).textContent).toBe(
         'Já existe uma campanha com esse nome.',
      );
      expect(fakes.navigate).not.toHaveBeenCalled();
      expect(screen.getByTestId('campaign-summary').textContent).toContain('Campanha de software');

      // Act
      fireEvent.click(screen.getByTestId('campaign-save'));

      // Assert
      await waitFor(() => expect(fakes.navigate).toHaveBeenCalledTimes(1));
      expect(fakes.createCampaign).toHaveBeenCalledTimes(2);
      expect(fakes.createCampaign.mock.calls[1]?.[0]).toMatchObject({
         requestId: REQUEST_ID,
         name: 'Campanha de software',
      });
   });

   it('401 mostra a mensagem de sessão expirada', async () => {
      // Arrange
      fakes.createCampaign.mockRejectedValueOnce(axiosFailure(401));
      render(<Harness fakes={fakes} />);
      await goToSummary();

      // Act
      fireEvent.click(screen.getByTestId('campaign-save'));

      // Assert
      expect((await screen.findByTestId('campaign-submit-errors')).textContent).toBe(
         'Sua sessão expirou. Entre novamente para continuar.',
      );
   });

   it.each([
      ['500', axiosFailure(500)],
      ['erro de rede', new AxiosError('Network Error')],
      ['erro desconhecido', new Error('stack interno')],
   ])('%s mostra mensagem genérica sem detalhe interno', async (_name, failure) => {
      // Arrange
      fakes.createCampaign.mockRejectedValueOnce(failure);
      render(<Harness fakes={fakes} />);
      await goToSummary();

      // Act
      fireEvent.click(screen.getByTestId('campaign-save'));

      // Assert
      const text = (await screen.findByTestId('campaign-submit-errors')).textContent;
      expect(text).toBe('Não foi possível salvar a campanha. Tente novamente em instantes.');
      expect((screen.getByTestId('campaign-save') as HTMLButtonElement).disabled).toBe(false);
   });

   it('resposta false da API é tratada como falha e não navega', async () => {
      // Arrange
      fakes.createCampaign.mockResolvedValueOnce(false);
      render(<Harness fakes={fakes} />);
      await goToSummary();

      // Act
      fireEvent.click(screen.getByTestId('campaign-save'));

      // Assert
      expect(await screen.findByTestId('campaign-submit-errors')).toBeTruthy();
      expect(fakes.navigate).not.toHaveBeenCalled();
   });
});
