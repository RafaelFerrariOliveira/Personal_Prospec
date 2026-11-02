import { css } from 'styled-components';
import { colors } from './colors';
import { theme } from './themes';

/** Indicador de foco obrigatório em todo elemento interativo (ver styled-components.md). */
export const focusRing = css`
   &:focus-visible {
      outline: ${theme.borderWidths.focus} solid ${colors.neutro.gray[900]};
      outline-offset: ${theme.borderWidths.focus};
   }
`;
