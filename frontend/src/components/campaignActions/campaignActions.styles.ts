import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { primaryButton, secondaryButton } from '@extensions/designSystem/formControls';
import { focusRing } from '@extensions/designSystem/focusRing';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.section`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.sm};
   font-family: ${theme.fontFamily};
`;

export const ButtonRow = styled.div`
   display: flex;
   flex-wrap: wrap;
   gap: ${theme.spacing.sm};
`;

export const PrimaryButton = styled.button`
   ${primaryButton}
`;

export const SecondaryButton = styled.button`
   ${secondaryButton}
`;

export const DangerButton = styled.button`
   padding: ${theme.spacing.sm} ${theme.spacing.lg};
   border: ${theme.borderWidths.thin} solid ${colors.feedback.danger.bar};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.feedback.danger.bg};
   color: ${colors.feedback.danger.fg};
   font-family: ${theme.fontFamily};
   font-size: ${theme.fontSizes.button};
   font-weight: ${theme.fontWeights.bold};
   cursor: pointer;
   transition: background-color ${theme.durations.fast} ease-in-out;

   &:hover {
      background-color: ${colors.feedback.error.bg};
   }

   &:active {
      background-color: ${colors.feedback.error.border};
   }

   &:disabled {
      cursor: not-allowed;
      opacity: ${theme.opacities.disabled};
   }

   ${focusRing}
`;

export const Confirmation = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.sm};
   padding: ${theme.spacing.md};
   border: ${theme.borderWidths.thin} solid ${colors.feedback.danger.bar};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.feedback.danger.bg};
   color: ${colors.feedback.danger.fg};
   font-size: ${theme.fontSizes.button};
`;

export const Hint = styled.span`
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.muted};
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
