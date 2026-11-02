import Icon from '@components/icon/icon';
import { Container, Mark, Name } from './brand.styles';
import type { IBrandProps } from './brand.types';

const BRAND_NAME = 'Personal Prospec';

const Brand = ({ size = 'md' }: IBrandProps) => {
   return (
      <Container $size={size} data-testid="brand">
         <Mark $size={size}>
            <Icon name="sparkle" size={size === 'md' ? 'lg' : 'xl'} />
         </Mark>
         <Name $size={size}>{BRAND_NAME}</Name>
      </Container>
   );
};

export default Brand;
