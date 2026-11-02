import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { fieldError, fieldInput, fieldLabel, primaryButton } from '@extensions/designSystem/formControls';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.main`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   gap: ${theme.space[28]};
   min-height: 100vh;
   padding: ${theme.space[48]} ${theme.space[20]};
`;

export const Form = styled.form`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[20]};
   width: 100%;
   max-width: ${theme.sizes.loginCardMaxWidth};
   padding: ${theme.space[32]};
   border: ${theme.borderWidths.thin} solid ${colors.surface.border};
   border-radius: ${theme.rounded.panel};
   background-color: ${colors.surface.card};
   box-shadow: ${theme.shadows.panel};
`;

export const Heading = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[6]};
`;

export const Title = styled.h1`
   margin: 0;
   font-size: ${theme.fontSizes.cardTitle};
   font-weight: ${theme.fontWeights.bold};
   letter-spacing: ${theme.letterSpacings.tighter};
`;

export const Subtitle = styled.p`
   margin: 0;
   font-size: ${theme.fontSizes.base};
   color: ${colors.text.secondary};
`;

export const Field = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[6]};
`;

export const Label = styled.label`
   ${fieldLabel}
`;

export const Input = styled.input`
   ${fieldInput}
`;

export const FieldError = styled.span`
   ${fieldError}
`;

export const ErrorList = styled.ul`
   margin: 0;
   padding: 0;
   list-style: none;
   font-size: ${theme.fontSizes.small};
   color: ${colors.feedback.error.fg};
`;

export const SubmitButton = styled.button`
   ${primaryButton}
   width: 100%;
   box-shadow: none;
`;
