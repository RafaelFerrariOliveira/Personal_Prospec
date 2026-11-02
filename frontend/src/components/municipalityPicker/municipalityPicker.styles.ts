import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { fieldError, fieldInput, fieldLabel, smallButton } from '@extensions/designSystem/formControls';
import { focusRing } from '@extensions/designSystem/focusRing';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[6]};
`;

export const Label = styled.label`
   ${fieldLabel}
`;

export const Select = styled.select`
   ${fieldInput}
`;

export const Input = styled.input`
   ${fieldInput}
`;

export const Feedback = styled.span`
   font-family: inherit;
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.muted};
`;

export const ErrorBox = styled.div`
   display: flex;
   align-items: center;
   gap: ${theme.space[8]};
`;

export const ErrorText = styled.span`
   ${fieldError}
`;

export const RetryButton = styled.button`
   ${smallButton}
`;

export const CityList = styled.ul`
   max-height: ${theme.sizes.dropdownMaxHeight};
   margin: 0;
   padding: 0;
   overflow-y: auto;
   list-style: none;
   border: ${theme.borderWidths.thin} solid ${colors.surface.border};
   border-radius: ${theme.rounded.control};
   background-color: ${colors.surface.card};
`;

export const CityButton = styled.button<{ $isSelected: boolean }>`
   display: block;
   width: 100%;
   padding: ${theme.space[10]} ${theme.space[12]};
   border: none;
   border-bottom: ${theme.borderWidths.thin} solid ${colors.surface.divider};
   background-color: ${(props) => (props.$isSelected ? colors.primary[50] : 'transparent')};
   font-family: inherit;
   font-size: ${theme.fontSizes.button};
   font-weight: ${(props) => (props.$isSelected ? theme.fontWeights.bold : theme.fontWeights.regular)};
   color: ${colors.text.primary};
   text-align: left;
   cursor: pointer;

   &:hover {
      background-color: ${colors.surface.hover};
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

export const ChipList = styled.ul`
   display: flex;
   flex-wrap: wrap;
   gap: ${theme.space[6]};
   margin: 0;
   padding: 0;
   list-style: none;
`;

export const Chip = styled.li`
   display: flex;
   align-items: center;
   gap: ${theme.space[4]};
   min-height: ${theme.sizes.badge};
   padding: 0 ${theme.space[4]} 0 ${theme.space[10]};
   border-radius: ${theme.rounded.full};
   background-color: ${colors.primary[50]};
   font-family: inherit;
   font-size: ${theme.fontSizes.caption};
   color: ${colors.primary[700]};
`;

export const RemoveButton = styled.button`
   padding: 0 ${theme.space[4]};
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
