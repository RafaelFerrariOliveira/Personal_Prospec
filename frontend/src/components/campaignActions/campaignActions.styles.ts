import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import {
   actionButton,
   actionDangerButton,
   actionPrimaryButton,
   errorBox,
   fieldHint,
   smallButton,
   smallDangerButton,
} from '@extensions/designSystem/formControls';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[14]};
`;

export const ButtonRow = styled.div`
   display: flex;
   flex-wrap: wrap;
   gap: ${theme.space[8]};
`;

export const PrimaryButton = styled.button`
   ${actionPrimaryButton}
`;

export const SecondaryButton = styled.button`
   ${actionButton}
`;

export const DangerButton = styled.button`
   ${actionDangerButton}
`;

export const Confirmation = styled.div`
   display: flex;
   flex-wrap: wrap;
   align-items: center;
   justify-content: space-between;
   gap: ${theme.space[12]};
   padding: ${theme.space[12]} ${theme.space[14]};
   border: ${theme.borderWidths.thin} solid ${colors.feedback.error.border};
   border-radius: ${theme.rounded.box};
   background-color: ${colors.feedback.error.bg};
`;

export const ConfirmationText = styled.span`
   font-size: ${theme.fontSizes.small};
   color: ${colors.feedback.error.text};
`;

export const ConfirmationActions = styled.div`
   display: flex;
   gap: ${theme.space[8]};
`;

export const KeepButton = styled.button`
   ${smallButton}
`;

export const ConfirmButton = styled.button`
   ${smallDangerButton}
`;

export const Hint = styled.span`
   ${fieldHint}
`;

export const ErrorList = styled.ul`
   ${errorBox}
`;
