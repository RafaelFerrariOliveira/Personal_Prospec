/**
 * Medidas do design system; a identidade (cores e fonte) vem do protótipo oficial.
 * Tokens neutros mínimos de medida; componentes nunca usam número mágico, sempre estes tokens.
 */
export const theme = {
   spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
   },
   rounded: {
      sm: '0.25rem',
      md: '0.5rem',
      full: '9999px',
   },
   fontSizes: {
      caption: '0.75rem',
      body: '1rem',
      button: '0.875rem',
      pageTitle: '1.5rem',
   },
   fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
   fontWeights: {
      regular: 400,
      bold: 600,
   },
   borderWidths: {
      thin: '1px',
      focus: '2px',
      spinner: '0.25rem',
   },
   sizes: {
      spinner: '2.5rem',
      contentMaxWidth: '60rem',
      formMaxWidth: '24rem',
      visuallyHidden: '1px',
   },
   durations: {
      fast: '150ms',
      spinner: '800ms',
   },
   opacities: {
      overlay: 0.9,
      disabled: 0.5,
   },
   zIndexes: {
      overlay: 999,
   },
} as const;

export type TTheme = typeof theme;
