/**
 * Paleta extraída do protótipo oficial (decisão de 2026-11-02, ver CLAUDE.md e docs/design/alinhamento-visual-prototipo.md).
 * Componentes usam só estes tokens: nunca hex solto.
 */

// Escala neutra usada no protótipo (Main.dc.html): textos, bordas, fundos e pontos de estado.
const zinc = {
   50: '#FAFAFA',
   100: '#F4F4F5',
   200: '#E4E4E7',
   300: '#D4D4D8',
   400: '#A1A1AA',
   500: '#71717A',
   600: '#52525B',
   700: '#3F3F46',
   800: '#27272A',
   900: '#18181B',
} as const;

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
      // text: texto da confirmação de cancelamento sobre o fundo de erro (#7F1D1D no protótipo).
      error: { fg: '#B91C1C', bg: '#FEF2F2', border: '#FECACA', text: '#7F1D1D' },
   },
   text: {
      primary: zinc[900],
      // Texto de apoio mais forte que o secundário (objetivo da campanha, células da tabela).
      strong: zinc[700],
      secondary: zinc[600],
      muted: zinc[500],
   },
   surface: {
      page: '#F7F7F8',
      card: '#FFFFFF',
      subtle: zinc[50],
      hover: zinc[100],
      border: zinc[200],
      // Separador entre linhas e seções dentro de um cartão.
      divider: '#F0F0F2',
      // Borda tracejada dos estados vazios.
      dashed: zinc[300],
   },
   zinc,
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
