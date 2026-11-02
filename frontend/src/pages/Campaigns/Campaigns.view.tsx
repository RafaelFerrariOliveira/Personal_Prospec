import StatusBadge from '@components/statusBadge/statusBadge';
import {
   Container,
   EmptyBox,
   ErrorBox,
   ErrorText,
   Feedback,
   FilterField,
   Header,
   Label,
   List,
   Notice,
   PrimaryButton,
   RowButton,
   RowMeta,
   RowName,
   SecondaryButton,
   Select,
   Title,
} from './campaigns.styles';
import type { ICampaignsViewProps } from './Campaigns.types';

const CampaignsView = ({
   rows,
   statusFilter,
   statusOptions,
   showCreatedNotice,
   isLoadingFirstPage,
   isLoadingMore,
   hasMore,
   isEmpty,
   isFilteredEmpty,
   errorMessage,
   sentinelRef,
   onStatusChange,
   onOpenCampaign,
   onCreate,
   onRetry,
}: ICampaignsViewProps) => {
   return (
      <Container data-testid="campaigns">
         <Header>
            <Title>Campanhas</Title>
            <PrimaryButton type="button" data-testid="campaigns-new" onClick={onCreate}>
               Nova campanha
            </PrimaryButton>
         </Header>

         {showCreatedNotice && (
            <Notice role="status" data-testid="campaigns-created-notice">
               Campanha salva.
            </Notice>
         )}

         <FilterField>
            <Label htmlFor="campaigns-status">Estado</Label>
            <Select id="campaigns-status" value={statusFilter} data-testid="campaigns-status" onChange={onStatusChange}>
               {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                     {option.label}
                  </option>
               ))}
            </Select>
         </FilterField>

         {isLoadingFirstPage && (
            <Feedback role="status" data-testid="campaigns-loading">
               Carregando campanhas...
            </Feedback>
         )}

         {isEmpty && (
            <EmptyBox data-testid="campaigns-empty">
               <span>Você ainda não tem campanhas.</span>
               <PrimaryButton type="button" data-testid="campaigns-create-first" onClick={onCreate}>
                  Criar a primeira campanha
               </PrimaryButton>
            </EmptyBox>
         )}

         {isFilteredEmpty && <Feedback data-testid="campaigns-filtered-empty">Nenhuma campanha neste estado.</Feedback>}

         {rows.length > 0 && (
            <List data-testid="campaigns-list">
               {rows.map((row) => (
                  <li key={row.id}>
                     <RowButton
                        type="button"
                        data-testid={`campaigns-row-${row.id}`}
                        onClick={() => onOpenCampaign(row.id)}
                     >
                        <RowName>{row.name}</RowName>
                        <StatusBadge status={row.status} />
                        <RowMeta>
                           {row.segment} | {row.locationSummary} | {row.createdAtLabel}
                        </RowMeta>
                     </RowButton>
                  </li>
               ))}
            </List>
         )}

         {hasMore && <div ref={sentinelRef} aria-hidden="true" data-testid="infinite-scroll-sentinel" />}
         {isLoadingMore && (
            <Feedback role="status" data-testid="campaigns-loading-more">
               Carregando mais...
            </Feedback>
         )}

         {errorMessage && (
            <ErrorBox>
               <ErrorText role="alert" data-testid="campaigns-error">
                  {errorMessage}
               </ErrorText>
               <SecondaryButton type="button" data-testid="campaigns-retry" onClick={onRetry}>
                  Tentar de novo
               </SecondaryButton>
            </ErrorBox>
         )}
      </Container>
   );
};

export default CampaignsView;
