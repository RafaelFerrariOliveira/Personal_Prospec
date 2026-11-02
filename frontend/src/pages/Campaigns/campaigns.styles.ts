import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import {
   fieldError,
   fieldInput,
   fieldLabel,
   primaryButton,
   secondaryButton,
} from '@extensions/designSystem/formControls';
import { focusRing } from '@extensions/designSystem/focusRing';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.main`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.md};
   max-width: ${theme.sizes.contentMaxWidth};
   margin: 0 auto;
   padding: ${theme.spacing.xl} ${theme.spacing.md};
   font-family: ${theme.fontFamily};
`;

export const Header = styled.header`
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: ${theme.spacing.md};
`;

export const Title = styled.h1`
   margin: 0;
   font-size: ${theme.fontSizes.pageTitle};
   font-weight: ${theme.fontWeights.bold};
   color: ${colors.text.primary};
`;

export const Notice = styled.div`
   padding: ${theme.spacing.sm} ${theme.spacing.md};
   border: ${theme.borderWidths.thin} solid ${colors.feedback.success.border};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.feedback.success.bg};
   font-size: ${theme.fontSizes.button};
   color: ${colors.feedback.success.fg};
`;

export const FilterField = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.xs};
   max-width: ${theme.sizes.formMaxWidth};
`;

export const Label = styled.label`
   ${fieldLabel}
`;

export const Select = styled.select`
   ${fieldInput}
`;

export const List = styled.ul`
   display: flex;
   flex-direction: column;
   gap: ${theme.spacing.sm};
   margin: 0;
   padding: 0;
   list-style: none;
`;

export const RowButton = styled.button`
   display: grid;
   grid-template-columns: 1fr auto;
   gap: ${theme.spacing.xs} ${theme.spacing.md};
   width: 100%;
   padding: ${theme.spacing.md};
   border: ${theme.borderWidths.thin} solid ${colors.surface.border};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.surface.card};
   font-family: ${theme.fontFamily};
   text-align: left;
   cursor: pointer;
   transition: background-color ${theme.durations.fast} ease-in-out;

   &:hover {
      background-color: ${colors.surface.hover};
   }

   &:active {
      background-color: ${colors.primary[50]};
   }

   &:disabled {
      cursor: not-allowed;
      opacity: ${theme.opacities.disabled};
   }

   ${focusRing}
`;

export const RowName = styled.span`
   font-size: ${theme.fontSizes.body};
   font-weight: ${theme.fontWeights.bold};
   color: ${colors.text.primary};
`;

export const RowMeta = styled.span`
   grid-column: 1 / -1;
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.muted};
`;

export const Feedback = styled.span`
   font-size: ${theme.fontSizes.button};
   color: ${colors.text.muted};
`;

export const EmptyBox = styled.div`
   display: flex;
   flex-direction: column;
   align-items: flex-start;
   gap: ${theme.spacing.sm};
   padding: ${theme.spacing.lg};
   border: ${theme.borderWidths.thin} dashed ${colors.surface.border};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.surface.card};
   color: ${colors.text.secondary};
`;

export const ErrorBox = styled.div`
   display: flex;
   align-items: center;
   gap: ${theme.spacing.sm};
`;

export const ErrorText = styled.span`
   ${fieldError}
`;

export const PrimaryButton = styled.button`
   ${primaryButton}
`;

export const SecondaryButton = styled.button`
   ${secondaryButton}
`;
