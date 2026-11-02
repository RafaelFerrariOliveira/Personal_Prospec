import {
   Chip,
   ChipList,
   Container,
   ErrorText,
   Feedback,
   Input,
   Label,
   RemoveButton,
   ResultButton,
   ResultList,
} from './cnaeSearchInput.styles';
import type { ICnaeSearchInputViewProps } from './cnaeSearchInput.types';

const CnaeSearchInputView = ({
   term,
   results,
   selected,
   isLoading,
   isEmpty,
   isDisabled,
   isLimitReached,
   hint,
   errorMessage,
   onTermChange,
   onSelect,
   onRemove,
}: ICnaeSearchInputViewProps) => {
   return (
      <Container data-testid="cnae-search">
         <Label htmlFor="cnae-search-input">CNAE (código ou descrição)</Label>
         <Input
            id="cnae-search-input"
            type="search"
            autoComplete="off"
            value={term}
            disabled={isDisabled || isLimitReached}
            aria-invalid={Boolean(errorMessage)}
            data-testid="cnae-search-input"
            onChange={onTermChange}
         />
         {isLimitReached && <Feedback data-testid="cnae-search-limit">Limite de CNAE atingido.</Feedback>}
         {hint && <Feedback data-testid="cnae-search-hint">{hint}</Feedback>}
         {isLoading && (
            <Feedback role="status" data-testid="cnae-search-loading">
               Buscando...
            </Feedback>
         )}
         {isEmpty && <Feedback data-testid="cnae-search-empty">Nenhum CNAE encontrado.</Feedback>}
         {errorMessage && (
            <ErrorText role="alert" data-testid="cnae-search-error">
               {errorMessage}
            </ErrorText>
         )}
         {results.length > 0 && (
            <ResultList data-testid="cnae-search-results">
               {results.map((item) => (
                  <li key={item.code}>
                     <ResultButton
                        type="button"
                        disabled={isDisabled || isLimitReached}
                        data-testid={`cnae-search-result-${item.code}`}
                        onClick={() => onSelect(item)}
                     >
                        {item.code} {item.description}
                     </ResultButton>
                  </li>
               ))}
            </ResultList>
         )}
         {selected.length > 0 && (
            <ChipList data-testid="cnae-search-selected">
               {selected.map((item) => (
                  <Chip key={item.code}>
                     <span>
                        {item.code} {item.label === item.code ? '' : item.label}
                     </span>
                     <RemoveButton
                        type="button"
                        aria-label={`Remover CNAE ${item.code}`}
                        disabled={isDisabled}
                        data-testid={`cnae-search-remove-${item.code}`}
                        onClick={() => onRemove(item.code)}
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

export default CnaeSearchInputView;
