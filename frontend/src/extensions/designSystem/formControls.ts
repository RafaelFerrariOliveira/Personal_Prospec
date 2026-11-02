import { css } from 'styled-components';
import { colors } from './colors';
import { focusRing } from './focusRing';
import { theme } from './themes';

/** Trechos de estilo compartilhados (campos, botões, cartões e títulos), no padrão visual do protótipo oficial. */

export const fieldLabel = css`
   font-size: ${theme.fontSizes.small};
   font-weight: ${theme.fontWeights.medium};
   color: ${colors.text.primary};
`;

export const fieldInput = css`
   width: 100%;
   min-height: ${theme.sizes.control};
   padding: 0 ${theme.space[12]};
   border: ${theme.borderWidths.thin} solid ${colors.surface.border};
   border-radius: ${theme.rounded.control};
   background-color: ${colors.surface.card};
   font-family: inherit;
   font-size: ${theme.fontSizes.base};
   color: ${colors.text.primary};

   &:hover {
      border-color: ${colors.zinc[300]};
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

export const fieldTextarea = css`
   ${fieldInput}
   min-height: ${theme.sizes.textareaMinHeight};
   padding: ${theme.space[10]} ${theme.space[12]};
   line-height: ${theme.lineHeights.relaxed};
   resize: vertical;
`;

export const fieldError = css`
   font-size: ${theme.fontSizes.caption};
   color: ${colors.feedback.error.fg};
`;

export const fieldHint = css`
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.muted};
`;

const buttonBase = css`
   display: inline-flex;
   align-items: center;
   justify-content: center;
   gap: ${theme.space[8]};
   border-radius: ${theme.rounded.control};
   font-family: inherit;
   cursor: pointer;
   transition: background-color ${theme.durations.fast} ease-in-out;

   &:disabled {
      cursor: not-allowed;
      opacity: ${theme.opacities.disabled};
   }

   ${focusRing}
`;

/** Botão principal (44px): Salvar, Entrar, Nova campanha. */
export const primaryButton = css`
   ${buttonBase}
   min-height: ${theme.sizes.control};
   padding: 0 ${theme.space[18]};
   border: 0;
   background-color: ${colors.primary[600]};
   box-shadow: ${theme.shadows.primaryButton};
   color: ${colors.neutro.white};
   font-size: ${theme.fontSizes.base};
   font-weight: ${theme.fontWeights.bold};

   &:hover {
      background-color: ${colors.primary[700]};
   }

   &:active {
      background-color: ${colors.primary[700]};
   }
`;

/** Botão secundário (44px): Voltar, Cancelar. */
export const secondaryButton = css`
   ${buttonBase}
   min-height: ${theme.sizes.control};
   padding: 0 ${theme.space[16]};
   border: ${theme.borderWidths.thin} solid ${colors.surface.border};
   background-color: ${colors.surface.card};
   color: ${colors.text.primary};
   font-size: ${theme.fontSizes.base};
   font-weight: ${theme.fontWeights.medium};

   &:hover {
      background-color: ${colors.surface.hover};
   }

   &:active {
      background-color: ${colors.surface.border};
   }
`;

/** Ações de um cartão (40px): Pausar, Editar. */
export const actionButton = css`
   ${secondaryButton}
   min-height: ${theme.sizes.controlMedium};
   padding: 0 ${theme.space[14]};
   font-size: ${theme.fontSizes.small};
`;

/** Ação principal de um cartão (40px): Iniciar, Retomar. */
export const actionPrimaryButton = css`
   ${primaryButton}
   min-height: ${theme.sizes.controlMedium};
   padding: 0 ${theme.space[14]};
   box-shadow: none;
   font-size: ${theme.fontSizes.small};
`;

/** Ação destrutiva com contorno (40px): Cancelar campanha. */
export const actionDangerButton = css`
   ${actionButton}
   border-color: ${colors.feedback.error.border};
   color: ${colors.feedback.error.fg};

   &:hover {
      background-color: ${colors.feedback.error.bg};
   }

   &:active {
      background-color: ${colors.feedback.error.border};
   }
`;

/** Botão pequeno (36px): Visualizar, Voltar da confirmação, Tentar de novo. */
export const smallButton = css`
   ${secondaryButton}
   min-height: ${theme.sizes.controlSmall};
   padding: 0 ${theme.space[12]};
   border-radius: ${theme.rounded.md};
   font-size: ${theme.fontSizes.small};
`;

/** Confirmação destrutiva pequena (36px): Sim, cancelar. */
export const smallDangerButton = css`
   ${buttonBase}
   min-height: ${theme.sizes.controlSmall};
   padding: 0 ${theme.space[12]};
   border: 0;
   border-radius: ${theme.rounded.md};
   background-color: ${colors.feedback.error.fg};
   color: ${colors.neutro.white};
   font-size: ${theme.fontSizes.small};
   font-weight: ${theme.fontWeights.bold};

   &:hover {
      background-color: ${colors.feedback.error.text};
   }

   &:active {
      background-color: ${colors.feedback.error.text};
   }
`;

/** Botão com cara de link: Ver todas, voltar para Campanhas. */
export const textButton = css`
   ${buttonBase}
   gap: ${theme.space[4]};
   padding: ${theme.space[4]} 0;
   border: 0;
   background-color: transparent;
   color: ${colors.text.secondary};
   font-size: ${theme.fontSizes.small};

   &:hover {
      color: ${colors.text.primary};
   }

   &:active {
      color: ${colors.primary[700]};
   }
`;

export const card = css`
   border: ${theme.borderWidths.thin} solid ${colors.surface.border};
   border-radius: ${theme.rounded.card};
   background-color: ${colors.surface.card};
`;

export const pageTitle = css`
   margin: 0;
   font-size: ${theme.fontSizes.pageTitle};
   font-weight: ${theme.fontWeights.bold};
   letter-spacing: ${theme.letterSpacings.tighter};
`;

export const pageSubtitle = css`
   margin: 0;
   font-size: ${theme.fontSizes.base};
   color: ${colors.text.secondary};
`;

export const sectionTitle = css`
   margin: 0;
   font-size: ${theme.fontSizes.sectionTitle};
   font-weight: ${theme.fontWeights.bold};
`;

/** Caixa de mensagens de erro (lista vinda da API ou mensagem genérica). */
export const errorBox = css`
   margin: 0;
   padding: ${theme.space[10]} ${theme.space[12]} ${theme.space[10]} ${theme.space[28]};
   border: ${theme.borderWidths.thin} solid ${colors.feedback.error.border};
   border-radius: ${theme.rounded.control};
   background-color: ${colors.feedback.error.bg};
   font-size: ${theme.fontSizes.small};
   color: ${colors.feedback.error.fg};
`;

/** Estado vazio com borda tracejada. */
export const emptyState = css`
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: ${theme.space[8]};
   padding: ${theme.space[40]} ${theme.space[24]};
   border: ${theme.borderWidths.thin} dashed ${colors.surface.dashed};
   border-radius: ${theme.rounded.card};
   background-color: ${colors.surface.card};
   text-align: center;
`;
