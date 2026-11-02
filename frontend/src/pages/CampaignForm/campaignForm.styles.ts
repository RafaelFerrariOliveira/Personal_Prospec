import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import {
   fieldError,
   fieldInput,
   fieldLabel,
   primaryButton,
   secondaryButton,
} from '@extensions/designSystem/formControls';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.main`
   display: flex;
   justify-content: center;
   padding: ${theme.spacing.xl} ${theme.spacing.md};
   background-color: ${colors.surface.page};
`;

export const Card = styled.form`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.md};
   width: 100%;
   max-width: ${theme.sizes.wizardMaxWidth};
   padding: ${theme.spacing.lg};
   border: ${theme.borderWidths.thin} solid ${colors.surface.border};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.surface.card};
   font-family: ${theme.fontFamily};
`;

export const Title = styled.h1`
   margin: 0;
   font-size: ${theme.fontSizes.pageTitle};
   font-weight: ${theme.fontWeights.bold};
   color: ${colors.text.primary};
`;

export const StepList = styled.ol`
   display: flex;
   flex-wrap: wrap;
   gap: ${theme.spacing.sm};
   margin: 0;
   padding: 0;
   list-style: none;
`;

export const StepItem = styled.li<{ $isCurrent: boolean }>`
   padding: ${theme.spacing.xs} ${theme.spacing.sm};
   border-radius: ${theme.rounded.full};
   background-color: ${(props) => (props.$isCurrent ? colors.primary[500] : colors.surface.hover)};
   font-size: ${theme.fontSizes.caption};
   font-weight: ${theme.fontWeights.bold};
   color: ${(props) => (props.$isCurrent ? colors.neutro.white : colors.text.secondary)};
`;

export const Field = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.sm};
`;

export const Label = styled.label`
   ${fieldLabel}
`;

export const Input = styled.input`
   ${fieldInput}
`;

export const Textarea = styled.textarea`
   ${fieldInput}
   min-height: ${theme.sizes.textareaMinHeight};
   resize: vertical;
`;

export const FieldError = styled.span`
   ${fieldError}
`;

export const ErrorList = styled.ul`
   margin: 0;
   padding: ${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.sm} ${theme.spacing.lg};
   border: ${theme.borderWidths.thin} solid ${colors.feedback.error.border};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.feedback.error.bg};
   font-size: ${theme.fontSizes.button};
   color: ${colors.feedback.error.fg};
`;

export const Actions = styled.div`
   display: flex;
   justify-content: space-between;
   gap: ${theme.spacing.md};
`;

export const BackButton = styled.button`
   ${secondaryButton}
`;

export const PrimaryButton = styled.button`
   ${primaryButton}
   margin-left: auto;
`;
