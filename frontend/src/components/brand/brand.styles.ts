import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { theme } from '@extensions/designSystem/themes';

type TBrandSize = 'md' | 'lg';

export const Container = styled.div<{ $size: TBrandSize }>`
   display: flex;
   align-items: center;
   gap: ${theme.space[10]};
   padding: ${(props) => (props.$size === 'md' ? `${theme.space[4]} ${theme.space[8]}` : '0')};
`;

export const Mark = styled.span<{ $size: TBrandSize }>`
   display: flex;
   flex-shrink: 0;
   align-items: center;
   justify-content: center;
   width: ${(props) => (props.$size === 'md' ? theme.sizes.brandMark : theme.sizes.brandMarkLarge)};
   height: ${(props) => (props.$size === 'md' ? theme.sizes.brandMark : theme.sizes.brandMarkLarge)};
   border-radius: ${(props) => (props.$size === 'md' ? theme.rounded.control : theme.rounded.box)};
   background-color: ${colors.primary[600]};
   color: ${colors.neutro.white};
`;

export const Name = styled.span<{ $size: TBrandSize }>`
   font-size: ${(props) => (props.$size === 'md' ? theme.fontSizes.sectionTitle : theme.fontSizes.brand)};
   font-weight: ${theme.fontWeights.bold};
   letter-spacing: ${theme.letterSpacings.tight};
   color: ${colors.text.primary};
`;
