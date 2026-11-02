/**
 * [A DEFINIR] provisório até o Style Guide do projeto.
 * Só tons neutros, nenhuma cor de marca: não assumir identidade visual sem Style Guide definido.
 */
export const colors = {
   neutro: {
      white: '#FFFFFF',
      black: '#000000',
      gray: {
         100: '#F5F5F5',
         200: '#E5E5E5',
         300: '#D4D4D4',
         400: '#A3A3A3',
         500: '#737373',
         600: '#525252',
         700: '#404040',
         800: '#262626',
         900: '#171717',
      },
   },
} as const;

export type TColors = typeof colors;
