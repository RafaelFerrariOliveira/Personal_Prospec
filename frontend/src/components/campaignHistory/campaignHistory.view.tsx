import {
   Container,
   ErrorBox,
   ErrorText,
   Feedback,
   Heading,
   Item,
   ItemDate,
   ItemText,
   ItemTitle,
   List,
   RetryButton,
} from './campaignHistory.styles';
import type { ICampaignHistoryViewProps } from './campaignHistory.types';

const CampaignHistoryView = ({
   items,
   isLoadingFirstPage,
   isLoadingMore,
   hasMore,
   isEmpty,
   errorMessage,
   sentinelRef,
   onRetry,
}: ICampaignHistoryViewProps) => {
   return (
      <Container data-testid="campaign-history">
         <Heading>Histórico</Heading>
         {isLoadingFirstPage && (
            <Feedback role="status" data-testid="campaign-history-loading">
               Carregando histórico...
            </Feedback>
         )}
         {isEmpty && <Feedback data-testid="campaign-history-empty">Nenhum evento registrado.</Feedback>}
         {items.length > 0 && (
            <List data-testid="campaign-history-list">
               {items.map((item) => (
                  <Item key={item.key}>
                     <ItemTitle>{item.title}</ItemTitle>
                     <ItemText>{item.description}</ItemText>
                     <ItemDate>{item.occurredAtLabel}</ItemDate>
                  </Item>
               ))}
            </List>
         )}
         {hasMore && <div ref={sentinelRef} aria-hidden="true" data-testid="infinite-scroll-sentinel" />}
         {isLoadingMore && (
            <Feedback role="status" data-testid="campaign-history-loading-more">
               Carregando mais...
            </Feedback>
         )}
         {errorMessage && (
            <ErrorBox>
               <ErrorText role="alert" data-testid="campaign-history-error">
                  {errorMessage}
               </ErrorText>
               <RetryButton type="button" data-testid="campaign-history-retry" onClick={onRetry}>
                  Tentar de novo
               </RetryButton>
            </ErrorBox>
         )}
      </Container>
   );
};

export default CampaignHistoryView;
