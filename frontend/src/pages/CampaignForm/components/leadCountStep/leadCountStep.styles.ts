import styled from 'styled-components';
import { Field as BaseField } from '@pages/CampaignForm/campaignForm.styles';
import { theme } from '@extensions/designSystem/themes';

// Campos com o mesmo visual em todos os passos: reaproveita os estilos da página do formulário.
export { FieldError, FieldHint, Input, Label, RequiredMark } from '@pages/CampaignForm/campaignForm.styles';

// Campo numérico estreito, como no protótipo.
export const Field = styled(BaseField)`
   max-width: ${theme.sizes.numberFieldMaxWidth};
`;
