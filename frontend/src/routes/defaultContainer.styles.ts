import styled from 'styled-components';
import { theme } from '@extensions/designSystem/themes';

/** Estrutura das telas privadas como no protótipo: menu lateral e conteúdo, que quebra para baixo em tela estreita. */
export const Shell = styled.div`
   display: flex;
   flex-wrap: wrap;
   align-items: stretch;
   min-height: 100vh;
`;

export const Main = styled.main`
   flex: 999 1 ${theme.sizes.mainMinWidth};
   min-width: 0;
   padding: ${theme.space[36]} ${theme.sizes.mainPaddingInline} ${theme.space[72]};
`;

export const Content = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[28]};
   max-width: ${theme.sizes.mainMaxWidth};
   margin: 0 auto;
`;
