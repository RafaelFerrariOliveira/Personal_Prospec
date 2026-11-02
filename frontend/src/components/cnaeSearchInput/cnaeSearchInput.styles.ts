import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { fieldError, fieldInput, fieldLabel } from '@extensions/designSystem/formControls';
import { focusRing } from '@extensions/designSystem/focusRing';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.div`
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

export const Feedback = styled.span`
   font-family: ${theme.fontFamily};
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.muted};
`;

export const ErrorText = styled.span`
   ${fieldError}
`;

export const ResultList = styled.ul`
   max-height: ${theme.sizes.dropdownMaxHeight};
   margin: 0;
   padding: 0;
   overflow-y: auto;
   list-style: none;
   border: ${theme.borderWidths.thin} solid ${colors.surface.border};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.surface.card};
`;

export const ResultButton = styled.button`
   display: block;
   width: 100%;
   padding: ${theme.spacing.sm} ${theme.spacing.md};
   border: none;
   background-color: transparent;
   font-family: ${theme.fontFamily};
   font-size: ${theme.fontSizes.button};
   color: ${colors.text.primary};
   text-align: left;
   cursor: pointer;

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

export const ChipList = styled.ul`
   display: flex;
   flex-wrap: wrap;
   gap: ${theme.spacing.sm};
   margin: 0;
   padding: 0;
   list-style: none;
`;

export const Chip = styled.li`
   display: flex;
   align-items: center;
   gap: ${theme.spacing.xs};
   padding: ${theme.spacing.xs} ${theme.spacing.sm};
   border-radius: ${theme.rounded.full};
   background-color: ${colors.primary[50]};
   font-family: ${theme.fontFamily};
   font-size: ${theme.fontSizes.caption};
   color: ${colors.primary[700]};
`;

export const RemoveButton = styled.button`
   padding: 0 ${theme.spacing.xs};
   border: none;
   border-radius: ${theme.rounded.full};
   background-color: transparent;
   font-size: ${theme.fontSizes.button};
   color: ${colors.primary[700]};
   cursor: pointer;

   &:hover {
      background-color: ${colors.primary[200]};
   }

   &:active {
      background-color: ${colors.primary[200]};
   }

   &:disabled {
      cursor: not-allowed;
      opacity: ${theme.opacities.disabled};
   }

   ${focusRing}
`;
