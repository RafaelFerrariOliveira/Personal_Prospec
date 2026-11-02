import Icon from '@components/icon/icon';
import StatusBadge from '@components/statusBadge/statusBadge';
import {
   Container,
   ErrorBox,
   ErrorList,
   Feedback,
   Heading,
   PageHeader,
   PrimaryButton,
   RecentHeader,
   RecentRow,
   RecentSection,
   RetryButton,
   RowChevron,
   RowLocation,
   RowMain,
   RowMeta,
   RowName,
   SectionTitle,
   SeeAllButton,
   StatCard,
   StatGrid,
   StatIcon,
   StatLabel,
   StatTop,
   StatValue,
   Subtitle,
   Title,
} from './home.styles';
import type { IHomeViewProps } from './Home.types';

const HomeView = ({
   title,
   subtitle,
   stats,
   recentRows,
   isLoading,
   isRecentEmpty,
   errorMessages,
   onNewCampaign,
   onSeeAll,
   onOpenCampaign,
   onRetry,
}: IHomeViewProps) => {
   return (
      <Container data-testid="home">
         <PageHeader>
            <Heading>
               <Title>{title}</Title>
               <Subtitle>{subtitle}</Subtitle>
            </Heading>
            <PrimaryButton type="button" data-testid="home-new-campaign" onClick={onNewCampaign}>
               <Icon name="plus" size="md" />
               Nova campanha
            </PrimaryButton>
         </PageHeader>

         {errorMessages.length > 0 && (
            <ErrorBox>
               <ErrorList role="alert" data-testid="home-errors">
                  {errorMessages.map((message) => (
                     <li key={message}>{message}</li>
                  ))}
               </ErrorList>
               <RetryButton type="button" data-testid="home-retry" onClick={onRetry}>
                  Tentar de novo
               </RetryButton>
            </ErrorBox>
         )}

         <StatGrid>
            {stats.map((stat) => (
               <StatCard key={stat.key} data-testid={`home-stat-${stat.key}`}>
                  <StatTop>
                     <StatLabel>{stat.label}</StatLabel>
                     <StatIcon $tone={stat.tone}>
                        <Icon name={stat.icon} size="md" />
                     </StatIcon>
                  </StatTop>
                  <StatValue data-testid={`home-stat-${stat.key}-value`}>{stat.value}</StatValue>
               </StatCard>
            ))}
         </StatGrid>

         <RecentSection data-testid="home-recent">
            <RecentHeader>
               <SectionTitle>Campanhas recentes</SectionTitle>
               <SeeAllButton type="button" data-testid="home-see-all" onClick={onSeeAll}>
                  Ver todas
                  <Icon name="arrowRight" size="xs" />
               </SeeAllButton>
            </RecentHeader>
            {isLoading && (
               <Feedback role="status" data-testid="home-loading">
                  Carregando campanhas...
               </Feedback>
            )}
            {isRecentEmpty && <Feedback data-testid="home-recent-empty">Nenhuma campanha criada ainda.</Feedback>}
            {recentRows.map((row) => (
               <RecentRow
                  key={row.id}
                  type="button"
                  data-testid={`home-recent-row-${row.id}`}
                  onClick={() => onOpenCampaign(row.id)}
               >
                  <RowMain>
                     <RowName>{row.name}</RowName>
                     <RowMeta>{row.createdAtLabel}</RowMeta>
                  </RowMain>
                  <RowLocation>{row.locationSummary}</RowLocation>
                  <StatusBadge status={row.status} />
                  <RowChevron>
                     <Icon name="chevronRight" size="md" />
                  </RowChevron>
               </RecentRow>
            ))}
         </RecentSection>
      </Container>
   );
};

export default HomeView;
