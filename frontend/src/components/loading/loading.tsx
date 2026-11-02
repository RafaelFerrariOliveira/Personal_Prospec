import { Container, Spinner, VisuallyHidden } from './loading.styles';
import type { ILoadingProps } from './loading.types';

const Loading = ({ isLoading = false, label = 'Carregando' }: ILoadingProps) => {
   if (!isLoading) return null;

   return (
      <Container role="status" aria-live="polite" data-testid="loading">
         <Spinner aria-hidden="true" />
         <VisuallyHidden>{label}</VisuallyHidden>
      </Container>
   );
};

export default Loading;
