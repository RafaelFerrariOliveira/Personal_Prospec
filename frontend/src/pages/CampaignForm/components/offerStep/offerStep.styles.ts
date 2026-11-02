import styled from 'styled-components';
import { Textarea as BaseTextarea } from '@pages/CampaignForm/campaignForm.styles';
import { theme } from '@extensions/designSystem/themes';

// Campos com o mesmo visual em todos os passos: reaproveita os estilos da página do formulário.
export { Field, FieldError, FieldHint, Label } from '@pages/CampaignForm/campaignForm.styles';

// Textos da oferta têm altura menor no protótipo.
export const Textarea = styled(BaseTextarea)`
   min-height: ${theme.sizes.textareaCompactMinHeight};
`;
