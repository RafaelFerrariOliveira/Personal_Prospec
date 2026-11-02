/**
 * Paleta extraída do protótipo oficial (decisão de 2026-11-02, ver CLAUDE.md).
 * Componentes usam só estes tokens: nunca hex solto.
 */
export const colors = {
   primary: {
      50: '#EEF0FF',
      200: '#C7D2FE',
      500: '#4F46E5',
      600: '#4338CA',
      700: '#3730A3',
   },
   feedback: {
      success: { fg: '#166534', bg: '#ECFDF3', bar: '#16A34A', border: '#BBF7D0' },
      warning: { fg: '#92400E', bg: '#FFF7E6', bar: '#D97706' },
      danger: { fg: '#9F1239', bg: '#FFF1F3', bar: '#E11D48' },
      error: { fg: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
   },
   text: {
      primary: '#18181B',
      secondary: '#52525B',
      muted: '#71717A',
   },
   surface: {
      page: '#F7F7F8',
      card: '#FFFFFF',
      subtle: '#FAFAFA',
      hover: '#F4F4F5',
      border: '#E4E4E7',
   },
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
