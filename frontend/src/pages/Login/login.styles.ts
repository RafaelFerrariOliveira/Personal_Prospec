import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { focusRing } from '@extensions/designSystem/focusRing';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.main`
   display: flex;
   justify-content: center;
   padding: ${theme.spacing.xl} ${theme.spacing.md};
`;

export const Form = styled.form`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.sm};
   width: 100%;
   max-width: ${theme.sizes.formMaxWidth};
`;

export const Title = styled.h1`
   margin: 0 0 ${theme.spacing.md};
   font-size: ${theme.fontSizes.pageTitle};
   font-weight: ${theme.fontWeights.bold};
   color: ${colors.neutro.gray[900]};
`;

export const Label = styled.label`
   font-size: ${theme.fontSizes.button};
   font-weight: ${theme.fontWeights.bold};
   color: ${colors.neutro.gray[800]};
`;

export const Input = styled.input`
   padding: ${theme.spacing.sm} ${theme.spacing.md};
   border: ${theme.borderWidths.thin} solid ${colors.neutro.gray[400]};
   border-radius: ${theme.rounded.md};
   font-size: ${theme.fontSizes.body};
   color: ${colors.neutro.gray[900]};

   &:hover {
      border-color: ${colors.neutro.gray[600]};
   }

   &:disabled {
      cursor: not-allowed;
      opacity: ${theme.opacities.disabled};
   }

   ${focusRing}
`;

export const FieldError = styled.span`
   font-size: ${theme.fontSizes.caption};
   color: ${colors.neutro.gray[900]};
`;

export const ErrorList = styled.ul`
   margin: 0;
   padding: ${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.sm} ${theme.spacing.lg};
   border: ${theme.borderWidths.thin} solid ${colors.neutro.gray[800]};
   border-radius: ${theme.rounded.md};
   font-size: ${theme.fontSizes.button};
   color: ${colors.neutro.gray[900]};
`;

export const SubmitButton = styled.button`
   margin-top: ${theme.spacing.md};
   padding: ${theme.spacing.sm} ${theme.spacing.lg};
   border: ${theme.borderWidths.thin} solid ${colors.neutro.gray[800]};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.neutro.gray[900]};
   color: ${colors.neutro.white};
   font-size: ${theme.fontSizes.button};
   font-weight: ${theme.fontWeights.bold};
   cursor: pointer;
   transition: background-color ${theme.durations.fast} ease-in-out;

   &:hover {
      background-color: ${colors.neutro.gray[700]};
   }

   &:active {
      background-color: ${colors.neutro.gray[800]};
   }

   &:disabled {
      cursor: not-allowed;
      opacity: ${theme.opacities.disabled};
   }

   ${focusRing}
`;
