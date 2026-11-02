import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { theme } from '@extensions/designSystem/themes';

export const SummaryList = styled.dl`
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(${theme.sizes.fieldGridMinWidth}, 1fr));
   gap: ${theme.space[18]};
   margin: 0;
`;

export const SummaryItem = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[2]};
`;

export const SummaryTerm = styled.dt`
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.muted};
`;

export const SummaryValue = styled.dd`
   margin: 0;
   font-size: ${theme.fontSizes.base};
   font-weight: ${theme.fontWeights.medium};
   color: ${colors.text.primary};
   overflow-wrap: anywhere;
`;
