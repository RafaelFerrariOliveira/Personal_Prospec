import CampaignActions from '@components/campaignActions/CampaignActions';
import CampaignHistory from '@components/campaignHistory/CampaignHistory';
import Loading from '@components/loading/loading';
import StatusBadge from '@components/statusBadge/statusBadge';
import {
   ActionButton,
   Card,
   Container,
   DetailList,
   ErrorList,
   Header,
   Notice,
   ProgressText,
   Term,
   Title,
   Value,
} from './campaignDetail.styles';
import type { ICampaignDetailViewProps } from './CampaignDetail.types';

const CampaignDetailView = ({
   campaignId,
   name,
   status,
   items,
   progressText,
   refreshKey,
   isLoading,
   isNotFound,
   errorMessages,
   onChanged,
   onRetry,
   onBackToList,
}: ICampaignDetailViewProps) => {
   if (isLoading) return <Loading isLoading label="Carregando campanha" />;

   if (isNotFound) {
      return (
         <Container data-testid="campaign-detail">
            <Notice data-testid="campaign-detail-not-found">
               <span>Campanha não encontrada.</span>
               <ActionButton type="button" data-testid="campaign-detail-back" onClick={onBackToList}>
                  Voltar para as campanhas
               </ActionButton>
            </Notice>
         </Container>
      );
   }

   if (!status) {
      return (
         <Container data-testid="campaign-detail">
            <ErrorList role="alert" data-testid="campaign-detail-errors">
               {errorMessages.map((message) => (
                  <li key={message}>{message}</li>
               ))}
            </ErrorList>
            <ActionButton type="button" data-testid="campaign-detail-retry" onClick={onRetry}>
               Tentar de novo
            </ActionButton>
         </Container>
      );
   }

   return (
      <Container data-testid="campaign-detail">
         <Header>
            <Title data-testid="campaign-detail-name">{name}</Title>
            <StatusBadge status={status} />
         </Header>

         {errorMessages.length > 0 && (
            <ErrorList role="alert" data-testid="campaign-detail-errors">
               {errorMessages.map((message) => (
                  <li key={message}>{message}</li>
               ))}
            </ErrorList>
         )}

         <CampaignActions campaignId={campaignId} status={status} onChanged={onChanged} />

         <Card>
            <DetailList data-testid="campaign-detail-items">
               {items.map((item) => (
                  <div key={item.label}>
                     <Term>{item.label}</Term>
                     <Value>{item.value}</Value>
                  </div>
               ))}
            </DetailList>
         </Card>

         <Card>
            <ProgressText data-testid="campaign-detail-progress">{progressText}</ProgressText>
         </Card>

         <CampaignHistory campaignId={campaignId} refreshKey={refreshKey} />
      </Container>
   );
};

export default CampaignDetailView;
