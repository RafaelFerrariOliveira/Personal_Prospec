import Icon from '@components/icon/icon';
import Loading from '@components/loading/loading';
import {
   Actions,
   BackButton,
   BackLink,
   Card,
   Container,
   ErrorList,
   FieldError,
   Footer,
   Heading,
   NoticeCard,
   PrimaryButton,
   Section,
   SectionTitle,
   StepItem,
   StepList,
   Subtitle,
   Title,
} from './campaignForm.styles';
import type { ICampaignFormViewProps } from './CampaignForm.types';
import IdentificationStep from './components/identificationStep/identificationStep';
import LeadCountStep from './components/leadCountStep/leadCountStep';
import LocationStep from './components/locationStep/locationStep';
import OfferStep from './components/offerStep/offerStep';
import ProfileStep from './components/profileStep/profileStep';
import SummaryStep from './components/summaryStep/summaryStep';

const CampaignFormView = ({
   title,
   isLoading,
   isNotFound,
   isBlocked,
   blockedMessage,
   loadErrors,
   stepIndex,
   stepLabels,
   stepTitle,
   isFirstStep,
   isLastStep,
   register,
   errors,
   locations,
   cityLabels,
   cnaeCodes,
   cnaeLabels,
   leadCountLabel,
   summary,
   submitErrors,
   isSubmitting,
   onLocationsChange,
   onCnaeChange,
   onBack,
   onBackToList,
   onSubmit,
}: ICampaignFormViewProps) => {
   if (isLoading) return <Loading isLoading label="Carregando campanha" />;

   const backLink = (
      <BackLink type="button" data-testid="campaign-form-back-link" onClick={onBackToList}>
         <Icon name="chevronLeft" size="md" />
         Campanhas
      </BackLink>
   );

   if (isNotFound || isBlocked || loadErrors.length > 0) {
      return (
         <Container data-testid="campaign-form">
            {backLink}
            <NoticeCard>
               {isNotFound && <FieldError data-testid="campaign-form-not-found">Campanha não encontrada.</FieldError>}
               {isBlocked && <FieldError data-testid="campaign-form-blocked">{blockedMessage}</FieldError>}
               {loadErrors.length > 0 && (
                  <ErrorList role="alert" data-testid="campaign-form-load-errors">
                     {loadErrors.map((message) => (
                        <li key={message}>{message}</li>
                     ))}
                  </ErrorList>
               )}
               <BackButton type="button" data-testid="campaign-form-back-to-list" onClick={onBackToList}>
                  Voltar para as campanhas
               </BackButton>
            </NoticeCard>
         </Container>
      );
   }

   return (
      <Container data-testid="campaign-form">
         {backLink}
         <Heading>
            <Title>{title}</Title>
            <Subtitle>
               Descreva quem você quer alcançar. O agente de IA usa essas informações para encontrar e pontuar empresas.
            </Subtitle>
         </Heading>
         <StepList aria-label="Etapas" data-testid="campaign-form-steps">
            {stepLabels.map((label, index) => (
               <StepItem
                  key={label}
                  $isCurrent={index === stepIndex}
                  aria-current={index === stepIndex ? 'step' : undefined}
               >
                  {index + 1}. {label}
               </StepItem>
            ))}
         </StepList>

         <Card noValidate onSubmit={onSubmit} data-testid="campaign-form-card">
            <Section aria-labelledby="campaign-form-section-title">
               <SectionTitle id="campaign-form-section-title">{stepTitle}</SectionTitle>
               {stepIndex === 0 && <IdentificationStep register={register} errors={errors} />}
               {stepIndex === 1 && (
                  <LocationStep
                     locations={locations}
                     cityLabels={cityLabels}
                     onLocationsChange={onLocationsChange}
                     errorMessage={errors.locations?.message}
                  />
               )}
               {stepIndex === 2 && (
                  <ProfileStep
                     register={register}
                     errors={errors}
                     cnaeCodes={cnaeCodes}
                     cnaeLabels={cnaeLabels}
                     onCnaeChange={onCnaeChange}
                  />
               )}
               {stepIndex === 3 && <OfferStep register={register} errors={errors} />}
               {stepIndex === 4 && <LeadCountStep register={register} errors={errors} label={leadCountLabel} />}
               {isLastStep && <SummaryStep items={summary} />}
            </Section>

            <Footer>
               {submitErrors.length > 0 && (
                  <ErrorList role="alert" data-testid="campaign-submit-errors">
                     {submitErrors.map((message) => (
                        <li key={message}>{message}</li>
                     ))}
                  </ErrorList>
               )}
               <Actions>
                  {isFirstStep ? (
                     <BackButton type="button" data-testid="campaign-cancel" onClick={onBackToList}>
                        Cancelar
                     </BackButton>
                  ) : (
                     <BackButton type="button" data-testid="campaign-back" disabled={isSubmitting} onClick={onBack}>
                        Voltar
                     </BackButton>
                  )}
                  {isLastStep ? (
                     <PrimaryButton key="save" type="submit" data-testid="campaign-save" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar campanha'}
                     </PrimaryButton>
                  ) : (
                     <PrimaryButton key="next" type="submit" data-testid="campaign-next">
                        Avançar
                     </PrimaryButton>
                  )}
               </Actions>
            </Footer>
         </Card>
      </Container>
   );
};

export default CampaignFormView;
