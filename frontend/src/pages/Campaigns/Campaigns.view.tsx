import Icon from '@components/icon/icon';
import StatusBadge from '@components/statusBadge/statusBadge';
import {
   ActionCell,
   CellText,
   Container,
   EmptyBox,
   EmptyText,
   EmptyTitle,
   ErrorBox,
   ErrorText,
   Feedback,
   FilterField,
   HeaderCellEnd,
   HeaderRow,
   Heading,
   Label,
   NameButton,
   NameCell,
   Notice,
   PageHeader,
   PrimaryButton,
   RetryButton,
   Row,
   SecondaryText,
   Select,
   Subtitle,
   Table,
   TableScroll,
   TableSection,
   Title,
   ViewButton,
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
         <PageHeader>
            <Heading>
               <Title>Campanhas</Title>
               <Subtitle>Gerencie suas campanhas de prospecção.</Subtitle>
            </Heading>
            <PrimaryButton type="button" data-testid="campaigns-new" onClick={onCreate}>
               <Icon name="plus" size="md" />
               Nova campanha
            </PrimaryButton>
         </PageHeader>

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

         {isEmpty ? (
            <EmptyBox data-testid="campaigns-empty">
               <EmptyTitle>Você ainda não tem campanhas</EmptyTitle>
               <EmptyText>Crie uma campanha para começar a prospecção.</EmptyText>
               <PrimaryButton type="button" data-testid="campaigns-create-first" onClick={onCreate}>
                  Criar a primeira campanha
               </PrimaryButton>
            </EmptyBox>
         ) : (
            <TableSection>
               <TableScroll>
                  <Table role="table" aria-label="Campanhas" data-testid="campaigns-list">
                     <HeaderRow role="row">
                        <span role="columnheader">Campanha</span>
                        <span role="columnheader">Localização</span>
                        <span role="columnheader">Estado</span>
                        <span role="columnheader">Criada em</span>
                        <HeaderCellEnd role="columnheader">Ações</HeaderCellEnd>
                     </HeaderRow>
                     {rows.map((row) => (
                        <Row key={row.id} role="row" data-testid={`campaigns-row-${row.id}`}>
                           <NameCell role="cell">
                              <NameButton
                                 type="button"
                                 data-testid={`campaigns-name-${row.id}`}
                                 onClick={() => onOpenCampaign(row.id)}
                              >
                                 {row.name}
                              </NameButton>
                              <SecondaryText>{row.segment}</SecondaryText>
                           </NameCell>
                           <CellText role="cell">{row.locationSummary}</CellText>
                           <span role="cell">
                              <StatusBadge status={row.status} />
                           </span>
                           <CellText role="cell">{row.createdAtLabel}</CellText>
                           <ActionCell role="cell">
                              <ViewButton
                                 type="button"
                                 aria-label={`Visualizar ${row.name}`}
                                 data-testid={`campaigns-open-${row.id}`}
                                 onClick={() => onOpenCampaign(row.id)}
                              >
                                 <Icon name="eye" size="sm" />
                                 Visualizar
                              </ViewButton>
                           </ActionCell>
                        </Row>
                     ))}
                  </Table>
               </TableScroll>

               {isLoadingFirstPage && (
                  <Feedback role="status" data-testid="campaigns-loading">
                     Carregando campanhas...
                  </Feedback>
               )}
               {isFilteredEmpty && (
                  <Feedback data-testid="campaigns-filtered-empty">Nenhuma campanha neste estado.</Feedback>
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
                     <RetryButton type="button" data-testid="campaigns-retry" onClick={onRetry}>
                        Tentar de novo
                     </RetryButton>
                  </ErrorBox>
               )}
            </TableSection>
         )}
      </Container>
   );
};

export default CampaignsView;
