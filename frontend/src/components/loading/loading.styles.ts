import styled, { keyframes } from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { theme } from '@extensions/designSystem/themes';

const spin = keyframes`
   to {
      transform: rotate(360deg);
   }
`;

export const Container = styled.div`
   position: fixed;
   inset: 0;
   display: flex;
   justify-content: center;
   align-items: center;
   background-color: ${colors.neutro.white};
   opacity: ${theme.opacities.overlay};
   z-index: ${theme.zIndexes.overlay};
`;

export const Spinner = styled.span`
   width: ${theme.sizes.spinner};
   height: ${theme.sizes.spinner};
   border: ${theme.borderWidths.spinner} solid ${colors.neutro.gray[300]};
   border-top-color: ${colors.neutro.gray[800]};
   border-radius: ${theme.rounded.full};
   animation: ${spin} ${theme.durations.spinner} linear infinite;

   @media (prefers-reduced-motion: reduce) {
      animation: none;
   }
`;

export const VisuallyHidden = styled.span`
   position: absolute;
   width: ${theme.sizes.visuallyHidden};
   height: ${theme.sizes.visuallyHidden};
   overflow: hidden;
   clip-path: inset(50%);
   white-space: nowrap;
`;
