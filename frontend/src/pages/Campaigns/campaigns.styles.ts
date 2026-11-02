import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import {
   card,
   emptyState,
   fieldError,
   fieldInput,
   fieldLabel,
   pageSubtitle,
   pageTitle,
   primaryButton,
   smallButton,
} from '@extensions/designSystem/formControls';
import { focusRing } from '@extensions/designSystem/focusRing';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[24]};
`;

export const PageHeader = styled.header`
   display: flex;
   flex-wrap: wrap;
   align-items: flex-end;
   justify-content: space-between;
   gap: ${theme.space[16]};
`;

export const Heading = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[6]};
`;

export const Title = styled.h1`
   ${pageTitle}
`;

export const Subtitle = styled.p`
   ${pageSubtitle}
`;

export const PrimaryButton = styled.button`
   ${primaryButton}
`;

export const Notice = styled.div`
   padding: ${theme.space[10]} ${theme.space[12]};
   border: ${theme.borderWidths.thin} solid ${colors.feedback.success.border};
   border-radius: ${theme.rounded.control};
   background-color: ${colors.feedback.success.bg};
   font-size: ${theme.fontSizes.small};
   color: ${colors.feedback.success.fg};
`;

export const FilterField = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[6]};
   max-width: ${theme.sizes.numberFieldMaxWidth};
`;

export const Label = styled.label`
   ${fieldLabel}
`;

export const Select = styled.select`
   ${fieldInput}
   min-height: ${theme.sizes.controlMedium};
`;

export const TableSection = styled.section`
   ${card}
   overflow: hidden;
`;

export const TableScroll = styled.div`
   overflow-x: auto;
`;

export const Table = styled.div`
   min-width: ${theme.sizes.tableMinWidth};
`;

const tableColumns = `minmax(${theme.sizes.tableNameMinWidth}, 1fr) ${theme.sizes.tableLocationWidth} ${theme.sizes.tableStatusWidth} ${theme.sizes.tableDateWidth} ${theme.sizes.tableActionWidth}`;

export const HeaderRow = styled.div`
   display: grid;
   grid-template-columns: ${tableColumns};
   gap: ${theme.space[16]};
   padding: ${theme.space[12]} ${theme.space[20]};
   border-bottom: ${theme.borderWidths.thin} solid ${colors.surface.border};
   background-color: ${colors.surface.subtle};
   font-size: ${theme.fontSizes.caption};
   font-weight: ${theme.fontWeights.medium};
   color: ${colors.text.secondary};
`;

export const HeaderCellEnd = styled.span`
   text-align: right;
`;

export const Row = styled.div`
   display: grid;
   grid-template-columns: ${tableColumns};
   gap: ${theme.space[16]};
   align-items: center;
   padding: ${theme.space[16]} ${theme.space[20]};
   border-bottom: ${theme.borderWidths.thin} solid ${colors.surface.divider};
`;

export const NameCell = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[3]};
   min-width: 0;
`;

export const NameButton = styled.button`
   overflow: hidden;
   padding: 0;
   border: 0;
   background-color: transparent;
   font-family: inherit;
   font-size: ${theme.fontSizes.base};
   font-weight: ${theme.fontWeights.bold};
   color: ${colors.text.primary};
   text-align: left;
   white-space: nowrap;
   text-overflow: ellipsis;
   cursor: pointer;

   &:hover {
      color: ${colors.primary[600]};
   }

   &:active {
      color: ${colors.primary[700]};
   }

   &:disabled {
      cursor: not-allowed;
      opacity: ${theme.opacities.disabled};
   }

   ${focusRing}
`;

export const SecondaryText = styled.span`
   overflow: hidden;
   font-size: ${theme.fontSizes.small};
   color: ${colors.text.secondary};
   white-space: nowrap;
   text-overflow: ellipsis;
`;

export const CellText = styled.span`
   font-size: ${theme.fontSizes.small};
   color: ${colors.text.strong};
   white-space: nowrap;
`;

export const ActionCell = styled.div`
   display: flex;
   justify-content: flex-end;
`;

export const ViewButton = styled.button`
   ${smallButton}
   gap: ${theme.space[6]};
`;

export const Feedback = styled.p`
   margin: 0;
   padding: ${theme.space[14]} ${theme.space[20]};
   font-size: ${theme.fontSizes.small};
   color: ${colors.text.secondary};
`;

export const EmptyBox = styled.div`
   ${emptyState}
`;

export const EmptyTitle = styled.span`
   font-size: ${theme.fontSizes.sectionTitle};
   font-weight: ${theme.fontWeights.bold};
`;

export const EmptyText = styled.span`
   font-size: ${theme.fontSizes.small};
   color: ${colors.text.secondary};
`;

export const ErrorBox = styled.div`
   display: flex;
   flex-wrap: wrap;
   align-items: center;
   gap: ${theme.space[12]};
   padding: ${theme.space[14]} ${theme.space[20]};
`;

export const ErrorText = styled.span`
   ${fieldError}
   font-size: ${theme.fontSizes.small};
`;

export const RetryButton = styled.button`
   ${smallButton}
`;
