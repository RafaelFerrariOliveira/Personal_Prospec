import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import UseCnaeSearchInputController from '@components/cnaeSearchInput/cnaeSearchInput.controller';
import type { TCnaeLabels } from '@components/cnaeSearchInput/cnaeSearchInput.types';
import CnaeSearchInputView from '@components/cnaeSearchInput/cnaeSearchInput.view';
import { CAMPAIGN_LIMITS } from '@domain/campaignLimits';
import type { IReferenceService } from '@interfaces/reference.interface';
import type { TCnaeResponse } from '@response/reference.response';

type TSearch = (search: string, options?: { signal?: AbortSignal }) => Promise<TCnaeResponse[]>;

const cnae = (code: string): TCnaeResponse => ({ code, description: `Descrição ${code}` });

// Harness: controller real + view real, com o valor controlado como o formulário faz; só o Service é falso.
const Harness = ({
   searchCnae,
   initial = [],
   isDisabled = false,
   onChangeSpy,
}: {
   searchCnae: TSearch;
   initial?: string[];
   isDisabled?: boolean;
   onChangeSpy?: (codes: string[], labels: TCnaeLabels) => void;
}) => {
   const [value, setValue] = useState<string[]>(initial);
   const [labels, setLabels] = useState<TCnaeLabels>({});
   // Service estável entre renders, como o container IoC entrega.
   const [referenceService] = useState(() => ({ searchCnae }) as unknown as IReferenceService);
   const controller = UseCnaeSearchInputController({
      referenceService,
      value,
      labels,
      isDisabled,
      onChange: (codes, nextLabels) => {
         onChangeSpy?.(codes, nextLabels);
         setValue(codes);
         setLabels(nextLabels);
      },
   });
   return <CnaeSearchInputView {...controller} />;
};

const type = async (value: string): Promise<void> => {
   fireEvent.change(screen.getByTestId('cnae-search-input'), { target: { value } });
   await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
   });
};

describe('UseCnaeSearchInputController', () => {
   beforeEach(() => {
      vi.useFakeTimers();
   });

   afterEach(() => {
      vi.useRealTimers();
   });

   it('não busca com menos de 2 caracteres e mostra a dica', async () => {
      // Arrange
      const searchCnae = vi.fn<TSearch>().mockResolvedValue([]);
      render(<Harness searchCnae={searchCnae} />);

      // Act
      await type('6');

      // Assert
      expect(searchCnae).not.toHaveBeenCalled();
      expect(screen.getByTestId('cnae-search-hint').textContent).toBe('Digite ao menos 2 caracteres.');
   });

   it('só busca depois do debounce de 300 ms, uma vez, com o termo final', async () => {
      // Arrange
      const searchCnae = vi.fn<TSearch>().mockResolvedValue([cnae('6201501')]);
      render(<Harness searchCnae={searchCnae} />);

      // Act
      fireEvent.change(screen.getByTestId('cnae-search-input'), { target: { value: '62' } });
      await act(async () => {
         await vi.advanceTimersByTimeAsync(200);
      });
      fireEvent.change(screen.getByTestId('cnae-search-input'), { target: { value: '620' } });
      await act(async () => {
         await vi.advanceTimersByTimeAsync(299);
      });
      expect(searchCnae).not.toHaveBeenCalled();
      await act(async () => {
         await vi.advanceTimersByTimeAsync(1);
      });

      // Assert
      expect(searchCnae).toHaveBeenCalledTimes(1);
      expect(searchCnae.mock.calls[0]?.[0]).toBe('620');
      expect(screen.getByTestId('cnae-search-result-6201501')).toBeTruthy();
   });

   it('mostra no máximo 20 resultados', async () => {
      // Arrange
      const many = Array.from({ length: 25 }, (_, index) => cnae(String(1000000 + index)));
      render(<Harness searchCnae={vi.fn<TSearch>().mockResolvedValue(many)} />);

      // Act
      await type('10');

      // Assert
      expect(screen.getByTestId('cnae-search-results').children).toHaveLength(CAMPAIGN_LIMITS.cnaeSearchMaxResults);
   });

   it('seleciona um CNAE, guarda o rótulo e não repete o mesmo código', async () => {
      // Arrange
      const onChangeSpy = vi.fn();
      render(<Harness searchCnae={vi.fn<TSearch>().mockResolvedValue([cnae('6201501')])} onChangeSpy={onChangeSpy} />);
      await type('62');

      // Act
      fireEvent.click(screen.getByTestId('cnae-search-result-6201501'));
      fireEvent.click(screen.getByTestId('cnae-search-result-6201501'));

      // Assert
      expect(onChangeSpy).toHaveBeenCalledTimes(1);
      expect(onChangeSpy).toHaveBeenCalledWith(['6201501'], { '6201501': 'Descrição 6201501' });
      expect(screen.getByTestId('cnae-search-selected').textContent).toContain('Descrição 6201501');
   });

   it('remove um CNAE selecionado', async () => {
      // Arrange
      const onChangeSpy = vi.fn();
      render(
         <Harness
            searchCnae={vi.fn<TSearch>().mockResolvedValue([])}
            initial={['6201501']}
            onChangeSpy={onChangeSpy}
         />,
      );

      // Act
      fireEvent.click(screen.getByTestId('cnae-search-remove-6201501'));

      // Assert
      expect(onChangeSpy).toHaveBeenCalledWith([], {});
      expect(screen.queryByTestId('cnae-search-selected')).toBeNull();
   });

   it('bloqueia a busca e a seleção ao atingir o limite de 20', async () => {
      // Arrange
      const full = Array.from({ length: CAMPAIGN_LIMITS.maxCnae }, (_, index) => String(1000000 + index));
      render(<Harness searchCnae={vi.fn<TSearch>().mockResolvedValue([])} initial={full} />);

      // Assert
      expect(screen.getByTestId('cnae-search-limit')).toBeTruthy();
      expect((screen.getByTestId('cnae-search-input') as HTMLInputElement).disabled).toBe(true);
   });

   it('desabilitado não altera a seleção', async () => {
      // Arrange
      const onChangeSpy = vi.fn();
      render(
         <Harness
            searchCnae={vi.fn<TSearch>().mockResolvedValue([])}
            initial={['6201501']}
            isDisabled
            onChangeSpy={onChangeSpy}
         />,
      );

      // Act
      fireEvent.click(screen.getByTestId('cnae-search-remove-6201501'));

      // Assert
      expect(onChangeSpy).not.toHaveBeenCalled();
   });

   it('mostra mensagem de erro quando a busca falha, sem resultados antigos', async () => {
      // Arrange
      render(<Harness searchCnae={vi.fn<TSearch>().mockRejectedValue(new Error('falha'))} />);

      // Act
      await type('62');

      // Assert
      expect(screen.getByTestId('cnae-search-error').textContent).toBe(
         'Não foi possível buscar o CNAE. Tente novamente.',
      );
      expect(screen.queryByTestId('cnae-search-empty')).toBeNull();
   });

   it('mostra estado vazio quando nada é encontrado', async () => {
      // Arrange
      render(<Harness searchCnae={vi.fn<TSearch>().mockResolvedValue([])} />);

      // Act
      await type('zz');

      // Assert
      expect(screen.getByTestId('cnae-search-empty')).toBeTruthy();
   });

   it('cancela a busca em andamento quando o termo muda', async () => {
      // Arrange
      const signals: AbortSignal[] = [];
      const searchCnae = vi.fn<TSearch>((_search, options) => {
         if (options?.signal) signals.push(options.signal);
         return new Promise<TCnaeResponse[]>(() => undefined);
      });
      render(<Harness searchCnae={searchCnae} />);
      await type('62');

      // Act
      await type('620');

      // Assert
      expect(signals).toHaveLength(2);
      expect(signals[0]?.aborted).toBe(true);
      expect(signals[1]?.aborted).toBe(false);
   });
});
