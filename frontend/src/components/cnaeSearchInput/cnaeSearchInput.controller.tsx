import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { CAMPAIGN_LIMITS } from '@domain/campaignLimits';
import type { TCnaeResponse } from '@response/reference.response';
import type { ICnaeSearchInputController, ICnaeSearchInputControllerDeps } from './cnaeSearchInput.types';

const DEFAULT_DEBOUNCE_MS = 300;
const SEARCH_ERROR_MESSAGE = 'Não foi possível buscar o CNAE. Tente novamente.';

const UseCnaeSearchInputController = ({
   referenceService,
   value,
   labels,
   onChange,
   isDisabled = false,
   errorMessage,
   debounceMs = DEFAULT_DEBOUNCE_MS,
}: ICnaeSearchInputControllerDeps): ICnaeSearchInputController => {
   const [term, setTerm] = useState('');
   const [debouncedTerm, setDebouncedTerm] = useState('');
   const [results, setResults] = useState<TCnaeResponse[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [searchError, setSearchError] = useState<string | null>(null);

   useEffect(() => {
      const timer = setTimeout(() => setDebouncedTerm(term.trim()), debounceMs);
      return () => clearTimeout(timer);
   }, [term, debounceMs]);

   useEffect(() => {
      if (debouncedTerm.length < CAMPAIGN_LIMITS.cnaeSearchMinLength) {
         setResults([]);
         setIsLoading(false);
         setSearchError(null);
         return undefined;
      }
      const controller = new AbortController();
      setIsLoading(true);
      setSearchError(null);
      const search = async (): Promise<void> => {
         try {
            const found = await referenceService.searchCnae(debouncedTerm, { signal: controller.signal });
            // Busca de um termo antigo (ou depois de desmontar) é descartada.
            if (controller.signal.aborted) return;
            setResults(found.slice(0, CAMPAIGN_LIMITS.cnaeSearchMaxResults));
         } catch {
            if (controller.signal.aborted) return;
            setResults([]);
            setSearchError(SEARCH_ERROR_MESSAGE);
         } finally {
            if (!controller.signal.aborted) setIsLoading(false);
         }
      };
      void search();
      return () => controller.abort();
   }, [debouncedTerm, referenceService]);

   const isLimitReached = value.length >= CAMPAIGN_LIMITS.maxCnae;

   const onTermChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
      setTerm(event.target.value);
   }, []);

   const onSelect = useCallback(
      (item: TCnaeResponse): void => {
         if (isDisabled || isLimitReached || value.includes(item.code)) return;
         onChange([...value, item.code], { ...labels, [item.code]: item.description });
      },
      [isDisabled, isLimitReached, value, labels, onChange],
   );

   const onRemove = useCallback(
      (code: string): void => {
         if (isDisabled) return;
         onChange(
            value.filter((current) => current !== code),
            labels,
         );
      },
      [isDisabled, value, labels, onChange],
   );

   const trimmedLength = term.trim().length;
   const hint =
      trimmedLength > 0 && trimmedLength < CAMPAIGN_LIMITS.cnaeSearchMinLength
         ? `Digite ao menos ${CAMPAIGN_LIMITS.cnaeSearchMinLength} caracteres.`
         : null;

   return {
      term,
      results,
      selected: value.map((code) => ({ code, label: labels[code] ?? code })),
      isLoading,
      isEmpty:
         !isLoading &&
         !searchError &&
         debouncedTerm.length >= CAMPAIGN_LIMITS.cnaeSearchMinLength &&
         results.length === 0,
      isDisabled,
      isLimitReached,
      hint,
      errorMessage: searchError ?? errorMessage ?? null,
      onTermChange,
      onSelect,
      onRemove,
   };
};

export default UseCnaeSearchInputController;
