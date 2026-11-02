import Icon from '@components/icon/icon';
import Loading from '@components/loading/loading';
import {
   Card,
   Container,
   ErrorList,
   Heading,
   Hint,
   InfoBox,
   InfoLabel,
   InfoMeta,
   InfoName,
   Orb,
   PrimaryButton,
   SecondaryButton,
   Subtitle,
   SuccessPill,
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
         <Card aria-live="polite">
            <Orb>
               <Icon name="sparkle" size="hero" />
            </Orb>
            <SuccessPill>
               <Icon name="check" size="xs" />
               Campanha iniciada
            </SuccessPill>
            <Heading>
               <Title>Agente de IA iniciado</Title>
               <Subtitle>Pesquisando empresas que correspondem ao perfil da campanha...</Subtitle>
            </Heading>
            <InfoBox>
               <InfoLabel>Campanha</InfoLabel>
               <InfoName data-testid="campaign-started-name">{name}</InfoName>
               <InfoMeta>
                  <span data-testid="campaign-started-target">Meta: {targetLeadCount} leads</span>
                  <span aria-hidden="true">·</span>
                  <span data-testid="campaign-started-location">{locationSummary}</span>
               </InfoMeta>
            </InfoBox>
            <PrimaryButton type="button" data-testid="campaign-started-open" onClick={onOpenDetail}>
               Acompanhar campanha
               <Icon name="arrowRight" size="md" />
            </PrimaryButton>
            <Hint>Você será levado à campanha em instantes.</Hint>
         </Card>
      </Container>
   );
};

export default CampaignStartedView;
