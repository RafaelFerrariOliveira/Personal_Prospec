import {
   CityButton,
   CityList,
   Chip,
   ChipList,
   Container,
   ErrorBox,
   ErrorText,
   Feedback,
   Input,
   Label,
   RemoveButton,
   RetryButton,
   Select,
} from './municipalityPicker.styles';
import type { IMunicipalityPickerViewProps } from './municipalityPicker.types';

const MunicipalityPickerView = ({
   states,
   stateCode,
   term,
   cities,
   selected,
   isLoadingStates,
   isLoadingFirstPage,
   isLoadingMore,
   hasMore,
   isEmpty,
   isLimitReached,
   isDisabled,
   loadErrorMessage,
   fieldErrorMessage,
   listRef,
   sentinelRef,
   onStateChange,
   onTermChange,
   onToggle,
   onRemove,
   onRetry,
}: IMunicipalityPickerViewProps) => {
   return (
      <Container data-testid="municipality-picker">
         <Label htmlFor="municipality-state">UF</Label>
         <Select
            id="municipality-state"
            value={stateCode}
            disabled={isDisabled || isLoadingStates}
            aria-invalid={Boolean(fieldErrorMessage)}
            data-testid="municipality-state"
            onChange={onStateChange}
         >
            <option value="">{isLoadingStates ? 'Carregando...' : 'Selecione a UF'}</option>
            {states.map((state) => (
               <option key={state.code} value={state.code}>
                  {state.code} {state.name}
               </option>
            ))}
         </Select>

         {stateCode && (
            <>
               <Label htmlFor="municipality-search">Cidade</Label>
               <Input
                  id="municipality-search"
                  type="search"
                  autoComplete="off"
                  value={term}
                  disabled={isDisabled}
                  data-testid="municipality-search"
                  onChange={onTermChange}
               />
               {isLimitReached && <Feedback data-testid="municipality-limit">Limite de cidades atingido.</Feedback>}
               {isLoadingFirstPage && (
                  <Feedback role="status" data-testid="municipality-loading">
                     Carregando cidades...
                  </Feedback>
               )}
               {isEmpty && <Feedback data-testid="municipality-empty">Nenhuma cidade encontrada.</Feedback>}
               {cities.length > 0 && (
                  <CityList ref={listRef} data-testid="municipality-list">
                     {cities.map((city) => (
                        <li key={city.code}>
                           <CityButton
                              type="button"
                              $isSelected={city.isSelected}
                              aria-pressed={city.isSelected}
                              disabled={isDisabled || (isLimitReached && !city.isSelected)}
                              data-testid={`municipality-city-${city.code}`}
                              onClick={() => onToggle(city)}
                           >
                              {city.name}
                           </CityButton>
                        </li>
                     ))}
                     {hasMore && <li ref={sentinelRef} aria-hidden="true" data-testid="infinite-scroll-sentinel" />}
                     {isLoadingMore && (
                        <li>
                           <Feedback role="status" data-testid="municipality-loading-more">
                              Carregando mais...
                           </Feedback>
                        </li>
                     )}
                  </CityList>
               )}
            </>
         )}

         {fieldErrorMessage && (
            <ErrorText role="alert" data-testid="municipality-field-error">
               {fieldErrorMessage}
            </ErrorText>
         )}

         {loadErrorMessage && (
            <ErrorBox>
               <ErrorText role="alert" data-testid="municipality-error">
                  {loadErrorMessage}
               </ErrorText>
               <RetryButton type="button" data-testid="municipality-retry" onClick={onRetry}>
                  Tentar de novo
               </RetryButton>
            </ErrorBox>
         )}

         {selected.length > 0 && (
            <ChipList data-testid="municipality-selected">
               {selected.map((city) => (
                  <Chip key={city.code}>
                     <span>{city.label}</span>
                     <RemoveButton
                        type="button"
                        aria-label={`Remover ${city.label}`}
                        disabled={isDisabled}
                        data-testid={`municipality-remove-${city.code}`}
                        onClick={() => onRemove(city.code)}
                     >
                        x
                     </RemoveButton>
                  </Chip>
               ))}
            </ChipList>
         )}
      </Container>
   );
};

export default MunicipalityPickerView;
