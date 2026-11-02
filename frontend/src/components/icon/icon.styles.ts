import styled from 'styled-components';
import { theme } from '@extensions/designSystem/themes';
import type { TIconSize } from './icon.types';

const SIZES: Record<TIconSize, string> = {
   xs: theme.sizes.iconXs,
   sm: theme.sizes.iconSm,
   md: theme.sizes.iconMd,
   lg: theme.sizes.iconLg,
   xl: theme.sizes.iconXl,
   hero: theme.sizes.iconHero,
};

export const Svg = styled.svg<{ $size: TIconSize }>`
   flex-shrink: 0;
   width: ${(props) => SIZES[props.$size]};
   height: ${(props) => SIZES[props.$size]};
`;
