import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { theme } from '@extensions/designSystem/themes';

export const SummaryList = styled.dl`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.sm};
   margin: 0;
`;

export const SummaryTerm = styled.dt`
   font-size: ${theme.fontSizes.caption};
   font-weight: ${theme.fontWeights.bold};
   color: ${colors.text.muted};
`;

export const SummaryValue = styled.dd`
   margin: 0;
   font-size: ${theme.fontSizes.body};
   color: ${colors.text.primary};
   overflow-wrap: anywhere;
`;
