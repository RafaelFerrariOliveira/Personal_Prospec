/**
 * Medidas do design system. Os valores novos vêm do protótipo oficial (Main.dc.html), convertidos de px para rem
 * (base 16px); o comentário de cada grupo indica a origem. Componentes nunca usam número mágico, sempre estes tokens.
 */
export const theme = {
   // Espaçamentos do protótipo, indexados pelo valor em px (gap, padding e margin usados nas telas).
   space: {
      2: '0.125rem',
      3: '0.1875rem',
      4: '0.25rem',
      6: '0.375rem',
      8: '0.5rem',
      10: '0.625rem',
      12: '0.75rem',
      14: '0.875rem',
      16: '1rem',
      18: '1.125rem',
      20: '1.25rem',
      22: '1.375rem',
      24: '1.5rem',
      28: '1.75rem',
      32: '2rem',
      36: '2.25rem',
      40: '2.5rem',
      48: '3rem',
      72: '4.5rem',
   },
   rounded: {
      // 8px: itens do menu, botões pequenos e ícones em bloco.
      md: '0.5rem',
      // 9px: campos e botões.
      control: '0.5625rem',
      // 10px: marca no login, caixas de informação e confirmação.
      box: '0.625rem',
      // 14px: cartões.
      card: '0.875rem',
      // 16px: cartão do login.
      panel: '1rem',
      // 18px: cartão da tela "Agente de IA iniciado".
      hero: '1.125rem',
      full: '9999px',
   },
   fontSizes: {
      // 12px
      caption: '0.75rem',
      // 13px
      small: '0.8125rem',
      // 14px: tamanho base do texto no protótipo.
      button: '0.875rem',
      base: '0.875rem',
      // 15px: títulos de seção, objetivo da campanha e marca no menu.
      sectionTitle: '0.9375rem',
      // 17px: marca no login.
      brand: '1.0625rem',
      // 22px: título de cartão (login e agente).
      cardTitle: '1.375rem',
      // 26px: título de página.
      pageTitle: '1.625rem',
      // 30px: número dos cartões de indicador.
      statValue: '1.875rem',
   },
   fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
   fontWeights: {
      regular: 400,
      medium: 500,
      bold: 600,
   },
   letterSpacings: {
      tight: '-0.01em',
      tighter: '-0.02em',
   },
   lineHeights: {
      base: 1.45,
      compact: 1.1,
      relaxed: 1.5,
   },
   borderWidths: {
      thin: '1px',
      focus: '2px',
      spinner: '0.25rem',
   },
   shadows: {
      // Cartão do login.
      panel: '0 1px 2px rgba(24,24,27,0.04), 0 12px 32px rgba(24,24,27,0.06)',
      // Cartão da tela "Agente de IA iniciado".
      raised: '0 12px 32px rgba(24,24,27,0.06)',
      // Botão principal.
      primaryButton: '0 1px 2px rgba(67,56,202,0.25)',
      // Anel do ícone do agente (valor em repouso da animação do protótipo).
      agentOrb: '0 0 0 6px rgba(79,70,229,0.14), 0 0 0 14px rgba(79,70,229,0.06)',
   },
   sizes: {
      spinner: '2.5rem',
      dropdownMaxHeight: '15rem',
      visuallyHidden: '1px',
      // Altura de campos e botões principais (44px), de itens do menu e ações (40px) e de botões pequenos (36px).
      control: '2.75rem',
      controlMedium: '2.5rem',
      controlSmall: '2.25rem',
      // Pílula de estado (24px), ponto de estado (6px).
      badge: '1.5rem',
      statusDot: '0.375rem',
      // Ícones (14, 15, 16, 18, 20 e 30px).
      iconXs: '0.875rem',
      iconSm: '0.9375rem',
      iconMd: '1rem',
      iconLg: '1.125rem',
      iconXl: '1.25rem',
      iconHero: '1.875rem',
      // Blocos de ícone: indicador (32px), andamento (40px), avatar (34px), marca (32px e 36px), agente (72px).
      iconTile: '2rem',
      iconTileLarge: '2.5rem',
      avatar: '2.125rem',
      brandMark: '2rem',
      brandMarkLarge: '2.25rem',
      agentOrb: '4.5rem',
      // Textos longos: 84px (objetivo, perfil) e 72px (oferta).
      textareaMinHeight: '5.25rem',
      textareaCompactMinHeight: '4.5rem',
      // Layout do app: menu (240px), conteúdo mínimo (560px) e máximo (1160px), margem lateral fluida (16px a 48px).
      sidebarWidth: '15rem',
      mainMinWidth: '35rem',
      mainMaxWidth: '72.5rem',
      mainPaddingInline: 'clamp(1rem, 4vw, 3rem)',
      // Larguras de bloco: login (400px), formulário (820px), agente (560px), objetivo (780px), número (260px).
      loginCardMaxWidth: '25rem',
      campaignFormMaxWidth: '51.25rem',
      agentCardMaxWidth: '35rem',
      descriptionMaxWidth: '48.75rem',
      numberFieldMaxWidth: '16.25rem',
      // Grades: cartão de indicador (220px) e campo lado a lado (240px).
      statCardMinWidth: '13.75rem',
      fieldGridMinWidth: '15rem',
      // Tabela de campanhas: largura mínima (880px) e colunas (280px, 180px, 150px, 120px e 136px).
      tableMinWidth: '55rem',
      tableNameMinWidth: '17.5rem',
      tableLocationWidth: '11.25rem',
      tableStatusWidth: '9.375rem',
      tableDateWidth: '7.5rem',
      tableActionWidth: '8.5rem',
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
