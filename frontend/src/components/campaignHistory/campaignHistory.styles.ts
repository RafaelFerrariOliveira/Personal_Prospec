import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { card, fieldError, sectionTitle, smallButton } from '@extensions/designSystem/formControls';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.section`
   ${card}
   overflow: hidden;
`;

export const Header = styled.div`
   padding: ${theme.space[14]} ${theme.space[20]};
`;

export const Heading = styled.h2`
   ${sectionTitle}
`;

export const List = styled.ol`
   margin: 0;
   padding: 0;
   list-style: none;
`;

export const Item = styled.li`
   display: grid;
   grid-template-columns: minmax(0, 1fr) auto;
   gap: ${theme.space[2]} ${theme.space[24]};
   align-items: center;
   padding: ${theme.space[14]} ${theme.space[20]};
   border-top: ${theme.borderWidths.thin} solid ${colors.surface.divider};
`;

export const ItemTitle = styled.span`
   font-size: ${theme.fontSizes.base};
   font-weight: ${theme.fontWeights.bold};
`;

export const ItemText = styled.span`
   grid-column: 1;
   font-size: ${theme.fontSizes.small};
   color: ${colors.text.secondary};
   overflow-wrap: anywhere;
`;

export const ItemDate = styled.span`
   grid-row: 1;
   grid-column: 2;
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.muted};
   white-space: nowrap;
`;

export const Feedback = styled.p`
   margin: 0;
   padding: ${theme.space[14]} ${theme.space[20]};
   border-top: ${theme.borderWidths.thin} solid ${colors.surface.divider};
   font-size: ${theme.fontSizes.small};
   color: ${colors.text.secondary};
`;

export const ErrorBox = styled.div`
   display: flex;
   flex-wrap: wrap;
   align-items: center;
   gap: ${theme.space[12]};
   padding: ${theme.space[14]} ${theme.space[20]};
   border-top: ${theme.borderWidths.thin} solid ${colors.surface.divider};
`;

export const ErrorText = styled.span`
   ${fieldError}
   font-size: ${theme.fontSizes.small};
`;

export const RetryButton = styled.button`
   ${smallButton}
`;
