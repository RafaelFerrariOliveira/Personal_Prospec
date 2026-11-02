import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { primaryButton, secondaryButton } from '@extensions/designSystem/formControls';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.main`
   display: flex;
   justify-content: center;
   padding: ${theme.spacing.xl} ${theme.spacing.md};
   font-family: ${theme.fontFamily};
`;

export const Card = styled.section`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.md};
   width: 100%;
   max-width: ${theme.sizes.wizardMaxWidth};
   padding: ${theme.spacing.lg};
   border: ${theme.borderWidths.thin} solid ${colors.feedback.success.border};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.feedback.success.bg};
`;

export const Title = styled.h1`
   margin: 0;
   font-size: ${theme.fontSizes.pageTitle};
   font-weight: ${theme.fontWeights.bold};
   color: ${colors.feedback.success.fg};
`;

export const Text = styled.p`
   margin: 0;
   font-size: ${theme.fontSizes.body};
   color: ${colors.text.primary};
   overflow-wrap: anywhere;
`;

export const Hint = styled.p`
   margin: 0;
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.muted};
`;

export const ErrorList = styled.ul`
   margin: 0;
   padding: ${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.sm} ${theme.spacing.lg};
   border: ${theme.borderWidths.thin} solid ${colors.feedback.error.border};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.feedback.error.bg};
   color: ${colors.feedback.error.fg};
`;

export const PrimaryButton = styled.button`
   ${primaryButton}
   align-self: flex-start;
`;

export const SecondaryButton = styled.button`
   ${secondaryButton}
   align-self: flex-start;
`;
