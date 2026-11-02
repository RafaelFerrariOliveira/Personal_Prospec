import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import UseMunicipalityPickerController from '@components/municipalityPicker/municipalityPicker.controller';
import type { TMunicipalityLabels } from '@components/municipalityPicker/municipalityPicker.types';
import MunicipalityPickerView from '@components/municipalityPicker/municipalityPicker.view';
import { CAMPAIGN_LIMITS } from '@domain/campaignLimits';
import type { IReferenceService } from '@interfaces/reference.interface';
import type { TCampaignLocation } from '@request/campaign.request';
import type { TMunicipalityPageResponse, TStateResponse } from '@response/reference.response';

type TGetMunicipalities = IReferenceService['getMunicipalities'];

const STATES = [
   { code: 'SP', name: 'SAO PAULO' },
   { code: 'RJ', name: 'RIO DE JANEIRO' },
];

const pageOf = (names: string[], totalPages = 1): TMunicipalityPageResponse => ({
   items: names.map((name, index) => ({ code: String(1000 + index), name })),
   totalCount: names.length,
   pageNumber: 1,
   pageSize: CAMPAIGN_LIMITS.municipalityPageSize,
   totalPages,
});

const Harness = ({
   getMunicipalities,
   getStates = vi.fn().mockResolvedValue(STATES),
   initial = [],
   onChangeSpy,
   errorMessage,
}: {
   getMunicipalities: TGetMunicipalities;
   getStates?: IReferenceService['getStates'];
   initial?: TCampaignLocation[];
   onChangeSpy?: (locations: TCampaignLocation[], labels: TMunicipalityLabels) => void;
   errorMessage?: string;
}) => {
   const [value, setValue] = useState<TCampaignLocation[]>(initial);
   const [labels, setLabels] = useState<TMunicipalityLabels>({});
   // Service estável entre renders, como o container IoC entrega.
   const [referenceService] = useState(() => ({ getStates, getMunicipalities }) as unknown as IReferenceService);
   const controller = UseMunicipalityPickerController({
      referenceService,
      value,
      labels,
      debounceMs: 300,
      errorMessage,
      onChange: (locations, nextLabels) => {
         onChangeSpy?.(locations, nextLabels);
         setValue(locations);
         setLabels(nextLabels);
      },
   });
   return <MunicipalityPickerView {...controller} />;
};

const chooseState = async (code: string): Promise<void> => {
   fireEvent.change(screen.getByTestId('municipality-state'), { target: { value: code } });
   await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
   });
};

const flush = async (): Promise<void> => {
   await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
   });
};

describe('UseMunicipalityPickerController', () => {
   beforeEach(() => {
      vi.useFakeTimers();
   });

   afterEach(() => {
      vi.useRealTimers();
   });

   it('carrega as UF e não busca cidades enquanto nenhuma UF foi escolhida', async () => {
      // Arrange
      const getMunicipalities = vi.fn<TGetMunicipalities>();
      render(<Harness getMunicipalities={getMunicipalities} />);

      // Act
      await flush();

      // Assert
      expect(screen.getByText('SP SAO PAULO')).toBeTruthy();
      expect(getMunicipalities).not.toHaveBeenCalled();
      expect(screen.queryByTestId('municipality-search')).toBeNull();
   });

   it('ao escolher a UF busca a primeira página de cidades', async () => {
      // Arrange
      const getMunicipalities = vi.fn<TGetMunicipalities>().mockResolvedValue(pageOf(['SAO PAULO', 'CAMPINAS']));
      render(<Harness getMunicipalities={getMunicipalities} />);
      await flush();

      // Act
      await chooseState('SP');

      // Assert
      expect(getMunicipalities.mock.calls[0]?.[0]).toMatchObject({ state: 'SP', pageNumber: 1, pageSize: 30 });
      expect(screen.getByText('CAMPINAS')).toBeTruthy();
   });

   it('seleciona e desmarca cidade, guardando o nome', async () => {
      // Arrange
      const onChangeSpy = vi.fn();
      render(
         <Harness
            getMunicipalities={vi.fn<TGetMunicipalities>().mockResolvedValue(pageOf(['SAO PAULO']))}
            onChangeSpy={onChangeSpy}
         />,
      );
      await flush();
      await chooseState('SP');

      // Act
      fireEvent.click(screen.getByTestId('municipality-city-1000'));

      // Assert
      expect(onChangeSpy).toHaveBeenLastCalledWith([{ state: 'SP', municipalityCode: '1000' }], {
         '1000': 'SAO PAULO',
      });
      expect(screen.getByTestId('municipality-selected').textContent).toContain('SAO PAULO');

      // Act
      fireEvent.click(screen.getByTestId('municipality-city-1000'));

      // Assert
      expect(onChangeSpy).toHaveBeenLastCalledWith([], { '1000': 'SAO PAULO' });
   });

   it('trocar a UF limpa as cidades selecionadas', async () => {
      // Arrange
      const onChangeSpy = vi.fn();
      render(
         <Harness
            getMunicipalities={vi.fn<TGetMunicipalities>().mockResolvedValue(pageOf(['SAO PAULO']))}
            initial={[{ state: 'SP', municipalityCode: '1000' }]}
            onChangeSpy={onChangeSpy}
         />,
      );
      await flush();

      // Act
      await chooseState('RJ');

      // Assert
      expect(onChangeSpy).toHaveBeenCalledWith([], {});
      expect(screen.queryByTestId('municipality-selected')).toBeNull();
   });

   it('bloqueia a 31ª cidade ao atingir o limite de 30', async () => {
      // Arrange
      const full = Array.from({ length: CAMPAIGN_LIMITS.maxCities }, (_, index) => ({
         state: 'SP',
         municipalityCode: String(2000 + index),
      }));
      const onChangeSpy = vi.fn();
      render(
         <Harness
            getMunicipalities={vi.fn<TGetMunicipalities>().mockResolvedValue(pageOf(['SAO PAULO']))}
            initial={full}
            onChangeSpy={onChangeSpy}
         />,
      );
      await flush();
      await flush();

      // Act
      fireEvent.click(screen.getByTestId('municipality-city-1000'));

      // Assert
      expect(screen.getByTestId('municipality-limit')).toBeTruthy();
      expect(onChangeSpy).not.toHaveBeenCalled();
   });

   it('busca por nome com debounce de 300 ms e reinicia a lista', async () => {
      // Arrange
      const getMunicipalities = vi.fn<TGetMunicipalities>().mockResolvedValue(pageOf(['CAMPINAS']));
      render(<Harness getMunicipalities={getMunicipalities} />);
      await flush();
      await chooseState('SP');
      getMunicipalities.mockClear();

      // Act
      fireEvent.change(screen.getByTestId('municipality-search'), { target: { value: 'camp' } });
      await act(async () => {
         await vi.advanceTimersByTimeAsync(299);
      });
      expect(getMunicipalities).not.toHaveBeenCalled();
      await act(async () => {
         await vi.advanceTimersByTimeAsync(1);
      });

      // Assert
      expect(getMunicipalities).toHaveBeenCalledTimes(1);
      expect(getMunicipalities.mock.calls[0]?.[0]).toMatchObject({ state: 'SP', search: 'camp', pageNumber: 1 });
   });

   it('mostra estado vazio quando a UF não devolve cidades', async () => {
      // Arrange
      render(<Harness getMunicipalities={vi.fn<TGetMunicipalities>().mockResolvedValue(pageOf([]))} />);
      await flush();

      // Act
      await chooseState('SP');

      // Assert
      expect(screen.getByTestId('municipality-empty')).toBeTruthy();
   });

   it('mostra erro ao falhar a lista de cidades e tenta de novo', async () => {
      // Arrange
      const getMunicipalities = vi
         .fn<TGetMunicipalities>()
         .mockRejectedValueOnce(new Error('falha'))
         .mockResolvedValueOnce(pageOf(['CAMPINAS']));
      render(<Harness getMunicipalities={getMunicipalities} />);
      await flush();
      await chooseState('SP');
      expect(screen.getByTestId('municipality-error').textContent).toBe(
         'Não foi possível carregar as cidades. Tente novamente.',
      );

      // Act
      fireEvent.click(screen.getByTestId('municipality-retry'));
      await flush();

      // Assert
      expect(screen.getByText('CAMPINAS')).toBeTruthy();
      expect(screen.queryByTestId('municipality-error')).toBeNull();
   });

   it('mostra erro ao falhar a lista de UF', async () => {
      // Arrange
      const getStates = vi.fn().mockRejectedValue(new Error('falha'));
      render(<Harness getMunicipalities={vi.fn<TGetMunicipalities>()} getStates={getStates} />);

      // Act
      await flush();

      // Assert
      expect(screen.getByTestId('municipality-error').textContent).toBe(
         'Não foi possível carregar as UF. Tente novamente.',
      );
   });

   it('Tentar de novo após falha nas UF recarrega as UF (não a lista de cidades)', async () => {
      // Arrange
      const getStates = vi.fn().mockRejectedValueOnce(new Error('falha')).mockResolvedValueOnce(STATES);
      const getMunicipalities = vi.fn<TGetMunicipalities>();
      render(<Harness getMunicipalities={getMunicipalities} getStates={getStates} />);
      await flush();

      // Act
      fireEvent.click(screen.getByTestId('municipality-retry'));
      await flush();

      // Assert
      expect(getStates).toHaveBeenCalledTimes(2);
      expect(getMunicipalities).not.toHaveBeenCalled();
      expect(screen.getByText('SP SAO PAULO')).toBeTruthy();
      expect(screen.queryByTestId('municipality-error')).toBeNull();
   });

   it('erro de validação do formulário aparece como erro do campo, sem Tentar de novo', async () => {
      // Arrange
      render(<Harness getMunicipalities={vi.fn<TGetMunicipalities>()} errorMessage="Escolha ao menos uma cidade." />);

      // Act
      await flush();

      // Assert
      expect(screen.getByTestId('municipality-field-error').textContent).toBe('Escolha ao menos uma cidade.');
      expect(screen.getByTestId('municipality-state').getAttribute('aria-invalid')).toBe('true');
      expect(screen.queryByTestId('municipality-retry')).toBeNull();
      expect(screen.queryByTestId('municipality-error')).toBeNull();
   });

   it('não atualiza o estado depois de desmontar com a busca de UF pendente', async () => {
      // Arrange
      let captured: AbortSignal | undefined;
      const getStates = vi.fn((options?: { signal?: AbortSignal }) => {
         captured = options?.signal;
         return new Promise<TStateResponse[]>(() => undefined);
      });
      const { unmount } = render(<Harness getMunicipalities={vi.fn<TGetMunicipalities>()} getStates={getStates} />);

      // Act
      unmount();

      // Assert
      expect(captured?.aborted).toBe(true);
   });

   it('cancela a busca de cidades em andamento ao trocar de UF', async () => {
      // Arrange
      const signals: AbortSignal[] = [];
      const getMunicipalities = vi.fn<TGetMunicipalities>((_query, options) => {
         if (options?.signal) signals.push(options.signal);
         return new Promise<TMunicipalityPageResponse>(() => undefined);
      });
      render(<Harness getMunicipalities={getMunicipalities} />);
      await flush();
      await chooseState('SP');

      // Act
      await chooseState('RJ');

      // Assert
      expect(signals[0]?.aborted).toBe(true);
      expect(signals[1]?.aborted).toBe(false);
   });
});

describe('UseMunicipalityPickerController: remoção e desabilitado', () => {
   const renderController = (
      onChange: (locations: TCampaignLocation[], labels: TMunicipalityLabels) => void,
      isDisabled: boolean,
   ) => {
      // Service criado fora do render: estável entre renders, como o container IoC entrega.
      const referenceService = {
         getStates: vi.fn().mockResolvedValue(STATES),
         getMunicipalities: vi.fn().mockResolvedValue(pageOf(['SAO PAULO'])),
      } as unknown as IReferenceService;
      return renderHook(() =>
         UseMunicipalityPickerController({
            referenceService,
            value: [{ state: 'SP', municipalityCode: '1000' }],
            labels: { '1000': 'SAO PAULO' },
            isDisabled,
            onChange,
         }),
      );
   };

   it('remover uma cidade selecionada avisa o formulário sem ela', () => {
      // Arrange
      const onChange = vi.fn();
      const { result } = renderController(onChange, false);

      // Act
      act(() => result.current.onRemove('1000'));

      // Assert
      expect(onChange).toHaveBeenCalledWith([], { '1000': 'SAO PAULO' });
   });

   it('desabilitado não remove nem seleciona cidade', () => {
      // Arrange
      const onChange = vi.fn();
      const { result } = renderController(onChange, true);

      // Act
      act(() => {
         result.current.onRemove('1000');
         result.current.onToggle({ code: '2000', name: 'CAMPINAS' });
      });

      // Assert
      expect(onChange).not.toHaveBeenCalled();
      expect(result.current.isDisabled).toBe(true);
   });
});
