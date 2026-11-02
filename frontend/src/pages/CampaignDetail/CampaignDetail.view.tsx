import CampaignActions from '@components/campaignActions/CampaignActions';
import CampaignHistory from '@components/campaignHistory/CampaignHistory';
import Icon from '@components/icon/icon';
import Loading from '@components/loading/loading';
import StatusBadge from '@components/statusBadge/statusBadge';
import {
   ActionButton,
   BackLink,
   Breadcrumb,
   BreadcrumbCurrent,
   Card,
   Container,
   DetailItem,
   DetailList,
   ErrorList,
   Header,
   MetaItem,
   MetaRow,
   NoticeCard,
   Objective,
   ProgressHeader,
   ProgressIcon,
   ProgressSub,
   ProgressTexts,
   ProgressTitle,
   SectionTitle,
   Term,
   Title,
   TitleRow,
   Value,
} from './campaignDetail.styles';
import type { ICampaignDetailViewProps } from './CampaignDetail.types';

const CampaignDetailView = ({
   campaignId,
   name,
   status,
   objective,
   locationSummary,
   segment,
   createdAtLabel,
   targetLabel,
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

   const breadcrumb = (current: string) => (
      <Breadcrumb aria-label="Trilha">
         <BackLink type="button" data-testid="campaign-detail-back-link" onClick={onBackToList}>
            <Icon name="chevronLeft" size="md" />
            Campanhas
         </BackLink>
         {current && (
            <>
               <span aria-hidden="true">/</span>
               <BreadcrumbCurrent>{current}</BreadcrumbCurrent>
            </>
         )}
      </Breadcrumb>
   );

   if (isNotFound) {
      return (
         <Container data-testid="campaign-detail">
            {breadcrumb('')}
            <NoticeCard data-testid="campaign-detail-not-found">
               <span>Campanha não encontrada.</span>
               <ActionButton type="button" data-testid="campaign-detail-back" onClick={onBackToList}>
                  Voltar para as campanhas
               </ActionButton>
            </NoticeCard>
         </Container>
      );
   }

   if (!status) {
      return (
         <Container data-testid="campaign-detail">
            {breadcrumb('')}
            <NoticeCard>
               <ErrorList role="alert" data-testid="campaign-detail-errors">
                  {errorMessages.map((message) => (
                     <li key={message}>{message}</li>
                  ))}
               </ErrorList>
               <ActionButton type="button" data-testid="campaign-detail-retry" onClick={onRetry}>
                  Tentar de novo
               </ActionButton>
            </NoticeCard>
         </Container>
      );
   }

   return (
      <Container data-testid="campaign-detail">
         {breadcrumb(name)}

         <Header>
            <TitleRow>
               <Title data-testid="campaign-detail-name">{name}</Title>
               <StatusBadge status={status} />
            </TitleRow>
            <Objective data-testid="campaign-detail-objective">{objective}</Objective>
            <MetaRow data-testid="campaign-detail-meta">
               <MetaItem data-testid="campaign-detail-location">
                  <Icon name="mapPin" size="sm" />
                  {locationSummary}
               </MetaItem>
               <MetaItem data-testid="campaign-detail-segment">
                  <Icon name="building" size="sm" />
                  {segment}
               </MetaItem>
               <MetaItem>
                  <Icon name="calendar" size="sm" />
                  {createdAtLabel}
               </MetaItem>
            </MetaRow>
         </Header>

         {errorMessages.length > 0 && (
            <ErrorList role="alert" data-testid="campaign-detail-errors">
               {errorMessages.map((message) => (
                  <li key={message}>{message}</li>
               ))}
            </ErrorList>
         )}

         <Card aria-label="Andamento da campanha">
            <ProgressHeader>
               <ProgressIcon>
                  <Icon name="robot" size="xl" />
               </ProgressIcon>
               <ProgressTexts aria-live="polite">
                  <ProgressTitle data-testid="campaign-detail-progress">{progressText}</ProgressTitle>
                  <ProgressSub>{targetLabel}</ProgressSub>
               </ProgressTexts>
            </ProgressHeader>
            <CampaignActions campaignId={campaignId} status={status} onChanged={onChanged} />
         </Card>

         <Card aria-labelledby="campaign-detail-config-title">
            <SectionTitle id="campaign-detail-config-title">Configuração</SectionTitle>
            <DetailList data-testid="campaign-detail-items">
               {items.map((item) => (
                  <DetailItem key={item.label}>
                     <Term>{item.label}</Term>
                     <Value>{item.value}</Value>
                  </DetailItem>
               ))}
            </DetailList>
         </Card>

         <CampaignHistory campaignId={campaignId} refreshKey={refreshKey} />
      </Container>
   );
};

export default CampaignDetailView;
