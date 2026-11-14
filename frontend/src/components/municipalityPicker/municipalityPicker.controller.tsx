import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useInfiniteScrollQuery } from '@hooks/useInfiniteScrollQuery';
import { useIntersectionObserver } from '@hooks/useIntersectionObserver';
import { CAMPAIGN_LIMITS } from '@domain/campaignLimits';
import type { TMunicipalityResponse, TStateResponse } from '@response/reference.response';
import { formatMunicipalityName } from '@utils/formatMunicipalityName';
import type { IMunicipalityPickerController, IMunicipalityPickerControllerDeps } from './municipalityPicker.types';

const DEFAULT_DEBOUNCE_MS = 300;
const STATES_ERROR_MESSAGE = 'Não foi possível carregar as UF. Tente novamente.';
const CITIES_ERROR_MESSAGE = 'Não foi possível carregar as cidades. Tente novamente.';

const UseMunicipalityPickerController = ({
   referenceService,
   value,
   labels,
   onChange,
   isDisabled = false,
   errorMessage,
   debounceMs = DEFAULT_DEBOUNCE_MS,
}: IMunicipalityPickerControllerDeps): IMunicipalityPickerController => {
   const [states, setStates] = useState<TStateResponse[]>([]);
   const [isLoadingStates, setIsLoadingStates] = useState(true);
   const [statesError, setStatesError] = useState<string | null>(null);
   const [statesReloadToken, setStatesReloadToken] = useState(0);
   const [stateCode, setStateCode] = useState(value[0]?.state ?? '');
   const [term, setTerm] = useState('');
   const [debouncedTerm, setDebouncedTerm] = useState('');
   const listRef = useRef<HTMLUListElement | null>(null);

   useEffect(() => {
      const controller = new AbortController();
      setIsLoadingStates(true);
      setStatesError(null);
      const loadStates = async (): Promise<void> => {
         try {
            const found = await referenceService.getStates({ signal: controller.signal });
            // Resposta que chega depois de desmontar é descartada.
            if (controller.signal.aborted) return;
            setStates(found);
         } catch {
            if (controller.signal.aborted) return;
            setStatesError(STATES_ERROR_MESSAGE);
         } finally {
            if (!controller.signal.aborted) setIsLoadingStates(false);
         }
      };
      void loadStates();
      return () => controller.abort();
   }, [referenceService, statesReloadToken]);

   useEffect(() => {
      const timer = setTimeout(() => setDebouncedTerm(term.trim()), debounceMs);
      return () => clearTimeout(timer);
   }, [term, debounceMs]);

   const { items, isLoadingFirstPage, isLoadingMore, hasMore, error, loadMore, reload } = useInfiniteScrollQuery({
      fetchPage: ({ pageNumber, pageSize, filters }, { signal }) =>
         referenceService.getMunicipalities(
            { state: filters.state, search: filters.search, pageNumber, pageSize },
            { signal },
         ),
      filters: { state: stateCode, search: debouncedTerm },
      pageSize: CAMPAIGN_LIMITS.municipalityPageSize,
      enabled: Boolean(stateCode),
   });

   const sentinelRef = useIntersectionObserver({ onIntersect: loadMore, enabled: hasMore, rootRef: listRef });

   const isLimitReached = value.length >= CAMPAIGN_LIMITS.maxCities;
   const selectedCodes = value.map((location) => location.municipalityCode);

   const onStateChange = useCallback(
      (event: ChangeEvent<HTMLSelectElement>): void => {
         setStateCode(event.target.value);
         setTerm('');
         setDebouncedTerm('');
         // A lista de cidades de outra UF não vale mais: limpa a seleção.
         if (value.length > 0) onChange([], labels);
      },
      [value.length, labels, onChange],
   );

   const onTermChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
      setTerm(event.target.value);
   }, []);

   const onToggle = useCallback(
      (city: TMunicipalityResponse): void => {
         if (isDisabled) return;
         if (selectedCodes.includes(city.code)) {
            onChange(
               value.filter((location) => location.municipalityCode !== city.code),
               labels,
            );
            return;
         }
         if (isLimitReached) return;
         onChange([...value, { state: stateCode, municipalityCode: city.code }], { ...labels, [city.code]: city.name });
      },
      [isDisabled, selectedCodes, isLimitReached, onChange, value, labels, stateCode],
   );

   const onRemove = useCallback(
      (code: string): void => {
         if (isDisabled) return;
         onChange(
            value.filter((location) => location.municipalityCode !== code),
            labels,
         );
      },
      [isDisabled, onChange, value, labels],
   );

   // "Tentar de novo" só existe para erro de rede: sem UF carregada, recarrega as UF; senão, a lista de cidades.
   const onRetry = useCallback((): void => {
      if (statesError) setStatesReloadToken((token) => token + 1);
      else if (items.length > 0) loadMore();
      else reload();
   }, [statesError, items.length, loadMore, reload]);

   return {
      states,
      stateCode,
      term,
      cities: items.map((city) => ({
         ...city,
         name: formatMunicipalityName(city.name),
         isSelected: selectedCodes.includes(city.code),
      })),
      selected: value.map((location) => ({
         code: location.municipalityCode,
         label: formatMunicipalityName(labels[location.municipalityCode] ?? location.municipalityCode),
      })),
      isLoadingStates,
      isLoadingFirstPage,
      isLoadingMore,
      hasMore,
      isEmpty: Boolean(stateCode) && !isLoadingFirstPage && !error && items.length === 0,
      isLimitReached,
      isDisabled,
      loadErrorMessage: statesError ?? (error ? CITIES_ERROR_MESSAGE : null),
      fieldErrorMessage: errorMessage ?? null,
      listRef,
      sentinelRef,
      onStateChange,
      onTermChange,
      onToggle,
      onRemove,
      onRetry,
   };
};

export default UseMunicipalityPickerController;
