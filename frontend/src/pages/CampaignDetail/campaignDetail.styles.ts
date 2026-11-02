import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { secondaryButton } from '@extensions/designSystem/formControls';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.main`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.lg};
   max-width: ${theme.sizes.contentMaxWidth};
   margin: 0 auto;
   padding: ${theme.spacing.xl} ${theme.spacing.md};
   font-family: ${theme.fontFamily};
`;

export const Header = styled.header`
   display: flex;
   align-items: center;
   flex-wrap: wrap;
   gap: ${theme.spacing.md};
`;

export const Title = styled.h1`
   margin: 0;
   font-size: ${theme.fontSizes.pageTitle};
   font-weight: ${theme.fontWeights.bold};
   color: ${colors.text.primary};
`;

export const Card = styled.section`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.sm};
   padding: ${theme.spacing.lg};
   border: ${theme.borderWidths.thin} solid ${colors.surface.border};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.surface.card};
`;

export const DetailList = styled.dl`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.sm};
   margin: 0;
`;

export const Term = styled.dt`
   font-size: ${theme.fontSizes.caption};
   font-weight: ${theme.fontWeights.bold};
   color: ${colors.text.muted};
`;

export const Value = styled.dd`
   margin: 0;
   font-size: ${theme.fontSizes.body};
   color: ${colors.text.primary};
   overflow-wrap: anywhere;
`;

export const ProgressText = styled.p`
   margin: 0;
   font-size: ${theme.fontSizes.button};
   color: ${colors.text.secondary};
`;

export const Notice = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.sm};
   align-items: flex-start;
   font-size: ${theme.fontSizes.body};
   color: ${colors.text.primary};
`;

export const ErrorList = styled.ul`
   margin: 0;
   padding: ${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.sm} ${theme.spacing.lg};
   border: ${theme.borderWidths.thin} solid ${colors.feedback.error.border};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.feedback.error.bg};
   font-size: ${theme.fontSizes.button};
   color: ${colors.feedback.error.fg};
`;

export const ActionButton = styled.button`
   ${secondaryButton}
`;
