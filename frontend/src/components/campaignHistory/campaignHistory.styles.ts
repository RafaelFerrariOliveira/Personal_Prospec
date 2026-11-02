import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { fieldError, secondaryButton } from '@extensions/designSystem/formControls';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.section`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.sm};
   font-family: ${theme.fontFamily};
`;

export const Heading = styled.h2`
   margin: 0;
   font-size: ${theme.fontSizes.body};
   font-weight: ${theme.fontWeights.bold};
   color: ${colors.text.primary};
`;

export const List = styled.ol`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.sm};
   margin: 0;
   padding: 0;
   list-style: none;
`;

export const Item = styled.li`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.xs};
   padding: ${theme.spacing.sm} ${theme.spacing.md};
   border: ${theme.borderWidths.thin} solid ${colors.surface.border};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.surface.card};
`;

export const ItemTitle = styled.span`
   font-size: ${theme.fontSizes.button};
   font-weight: ${theme.fontWeights.bold};
   color: ${colors.text.primary};
`;

export const ItemText = styled.span`
   font-size: ${theme.fontSizes.button};
   color: ${colors.text.secondary};
   overflow-wrap: anywhere;
`;

export const ItemDate = styled.span`
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.muted};
`;

export const Feedback = styled.span`
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.muted};
`;

export const ErrorBox = styled.div`
   display: flex;
   align-items: center;
   gap: ${theme.spacing.sm};
`;

export const ErrorText = styled.span`
   ${fieldError}
`;

export const RetryButton = styled.button`
   ${secondaryButton}
`;
