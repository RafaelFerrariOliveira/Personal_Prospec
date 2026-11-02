import { css } from 'styled-components';
import { colors } from './colors';
import { focusRing } from './focusRing';
import { theme } from './themes';

/** Trechos de estilo de formulário compartilhados pelas telas de campanha (paleta do protótipo oficial). */
export const fieldLabel = css`
   font-family: ${theme.fontFamily};
   font-size: ${theme.fontSizes.button};
   font-weight: ${theme.fontWeights.bold};
   color: ${colors.text.primary};
`;

export const fieldInput = css`
   padding: ${theme.spacing.sm} ${theme.spacing.md};
   border: ${theme.borderWidths.thin} solid ${colors.surface.border};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.surface.card};
   font-family: ${theme.fontFamily};
   font-size: ${theme.fontSizes.body};
   color: ${colors.text.primary};

   &:hover {
      border-color: ${colors.text.muted};
   }

   &:active {
      border-color: ${colors.primary[500]};
   }

   &:disabled {
      cursor: not-allowed;
      opacity: ${theme.opacities.disabled};
   }

   &[aria-invalid='true'] {
      border-color: ${colors.feedback.error.fg};
   }

   ${focusRing}
`;

export const fieldError = css`
   font-family: ${theme.fontFamily};
   font-size: ${theme.fontSizes.caption};
   color: ${colors.feedback.error.fg};
`;

export const primaryButton = css`
   padding: ${theme.spacing.sm} ${theme.spacing.lg};
   border: ${theme.borderWidths.thin} solid ${colors.primary[600]};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.primary[500]};
   color: ${colors.neutro.white};
   font-family: ${theme.fontFamily};
   font-size: ${theme.fontSizes.button};
   font-weight: ${theme.fontWeights.bold};
   cursor: pointer;
   transition: background-color ${theme.durations.fast} ease-in-out;

   &:hover {
      background-color: ${colors.primary[600]};
   }

   &:active {
      background-color: ${colors.primary[700]};
   }

   &:disabled {
      cursor: not-allowed;
      opacity: ${theme.opacities.disabled};
   }

   ${focusRing}
`;

export const secondaryButton = css`
   padding: ${theme.spacing.sm} ${theme.spacing.lg};
   border: ${theme.borderWidths.thin} solid ${colors.surface.border};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.surface.card};
   color: ${colors.text.primary};
   font-family: ${theme.fontFamily};
   font-size: ${theme.fontSizes.button};
   font-weight: ${theme.fontWeights.bold};
   cursor: pointer;
   transition: background-color ${theme.durations.fast} ease-in-out;

   &:hover {
      background-color: ${colors.surface.hover};
   }

   &:active {
      background-color: ${colors.surface.border};
   }

   &:disabled {
      cursor: not-allowed;
      opacity: ${theme.opacities.disabled};
   }

   ${focusRing}
`;
