import Loading from '@components/loading/loading';
import {
   Card,
   Container,
   ErrorList,
   Hint,
   PrimaryButton,
   SecondaryButton,
   Text,
   Title,
} from './campaignStarted.styles';
import type { ICampaignStartedViewProps } from './CampaignStarted.types';

const CampaignStartedView = ({
   name,
   targetLeadCount,
   locationSummary,
   isLoading,
   isNotFound,
   errorMessages,
   onOpenDetail,
   onBackToList,
}: ICampaignStartedViewProps) => {
   if (isLoading) return <Loading isLoading label="Carregando campanha" />;

   if (isNotFound || errorMessages.length > 0) {
      return (
         <Container data-testid="campaign-started">
            <Card>
               {isNotFound ? (
                  <Text data-testid="campaign-started-not-found">Campanha não encontrada.</Text>
               ) : (
                  <ErrorList role="alert" data-testid="campaign-started-errors">
                     {errorMessages.map((message) => (
                        <li key={message}>{message}</li>
                     ))}
                  </ErrorList>
               )}
               <SecondaryButton type="button" data-testid="campaign-started-back" onClick={onBackToList}>
                  Voltar para as campanhas
               </SecondaryButton>
            </Card>
         </Container>
      );
   }

   return (
      <Container data-testid="campaign-started">
         <Card>
            <Title>Agente de IA iniciado</Title>
            <Text data-testid="campaign-started-name">Campanha: {name}</Text>
            <Text data-testid="campaign-started-target">Meta: {targetLeadCount} leads</Text>
            <Text data-testid="campaign-started-location">Localização: {locationSummary}</Text>
            <Hint>Você será levado ao detalhe da campanha em instantes.</Hint>
            <PrimaryButton type="button" data-testid="campaign-started-open" onClick={onOpenDetail}>
               Ver detalhe da campanha
            </PrimaryButton>
         </Card>
      </Container>
   );
};

export default CampaignStartedView;
