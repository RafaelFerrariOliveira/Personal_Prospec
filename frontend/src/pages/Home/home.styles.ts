import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { focusRing } from '@extensions/designSystem/focusRing';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.main`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.md};
   max-width: ${theme.sizes.contentMaxWidth};
   margin: 0 auto;
   padding: ${theme.spacing.xl} ${theme.spacing.md};
`;

export const Title = styled.h1`
   margin: 0;
   font-size: ${theme.fontSizes.pageTitle};
   font-weight: ${theme.fontWeights.bold};
   color: ${colors.neutro.gray[900]};
`;

export const Description = styled.p`
   margin: 0;
   font-size: ${theme.fontSizes.body};
   color: ${colors.neutro.gray[700]};
`;

export const ActionButton = styled.button`
   align-self: flex-start;
   padding: ${theme.spacing.sm} ${theme.spacing.lg};
   border: ${theme.borderWidths.thin} solid ${colors.neutro.gray[800]};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.neutro.gray[900]};
   color: ${colors.neutro.white};
   font-size: ${theme.fontSizes.button};
   font-weight: ${theme.fontWeights.bold};
   cursor: pointer;
   transition: background-color ${theme.durations.fast} ease-in-out;

   &:hover {
      background-color: ${colors.neutro.gray[700]};
   }

   &:active {
      background-color: ${colors.neutro.gray[800]};
   }

   &:disabled {
      cursor: not-allowed;
      opacity: ${theme.opacities.disabled};
   }

   ${focusRing}
`;
