import { createGlobalStyle } from 'styled-components';
import { colors } from './colors';
import { theme } from './themes';

/** Base do documento como no protótipo: fonte Inter, texto e fundo da página, tamanho e altura de linha padrão. */
export const GlobalStyle = createGlobalStyle`
   *,
   *::before,
   *::after {
      box-sizing: border-box;
   }

   body {
      margin: 0;
      min-height: 100vh;
      font-family: ${theme.fontFamily};
      font-size: ${theme.fontSizes.base};
      line-height: ${theme.lineHeights.base};
      color: ${colors.text.primary};
      background-color: ${colors.surface.page};
   }

   button,
   input,
   select,
   textarea {
      font-family: inherit;
   }
`;
