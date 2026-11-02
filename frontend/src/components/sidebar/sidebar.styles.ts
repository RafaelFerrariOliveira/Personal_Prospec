import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { fieldError } from '@extensions/designSystem/formControls';
import { focusRing } from '@extensions/designSystem/focusRing';
import { theme } from '@extensions/designSystem/themes';

export const Aside = styled.aside`
   display: flex;
   flex: 1 1 ${theme.sizes.sidebarWidth};
   flex-direction: column;
   gap: ${theme.space[28]};
   padding: ${theme.space[20]} ${theme.space[14]};
   border-right: ${theme.borderWidths.thin} solid ${colors.surface.border};
   background-color: ${colors.surface.card};
`;

export const Nav = styled.nav`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[2]};
`;

export const NavButton = styled.button<{ $isCurrent: boolean }>`
   display: flex;
   align-items: center;
   gap: ${theme.space[10]};
   width: 100%;
   min-height: ${theme.sizes.controlMedium};
   padding: 0 ${theme.space[10]};
   border: 0;
   border-radius: ${theme.rounded.md};
   background-color: ${(props) => (props.$isCurrent ? colors.surface.hover : 'transparent')};
   font-family: inherit;
   font-size: ${theme.fontSizes.base};
   font-weight: ${(props) => (props.$isCurrent ? theme.fontWeights.bold : theme.fontWeights.medium)};
   color: ${(props) => (props.$isCurrent ? colors.text.primary : colors.text.secondary)};
   text-align: left;
   cursor: pointer;
   transition: background-color ${theme.durations.fast} ease-in-out;

   &:hover {
      background-color: ${colors.surface.hover};
      color: ${colors.text.primary};
   }

   &:active {
      background-color: ${colors.surface.border};
   }

   &:disabled {
      cursor: not-allowed;
      opacity: ${theme.opacities.disabled};
   }

   ${focusRing}
`;

export const Footer = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[8]};
   margin-top: auto;
   padding: ${theme.space[14]} ${theme.space[4]} 0 ${theme.space[8]};
   border-top: ${theme.borderWidths.thin} solid ${colors.surface.divider};
`;

export const UserRow = styled.div`
   display: flex;
   align-items: center;
   gap: ${theme.space[10]};
`;

export const Avatar = styled.span`
   display: flex;
   flex-shrink: 0;
   align-items: center;
   justify-content: center;
   width: ${theme.sizes.avatar};
   height: ${theme.sizes.avatar};
   border-radius: ${theme.rounded.full};
   background-color: ${colors.primary[50]};
   font-size: ${theme.fontSizes.small};
   font-weight: ${theme.fontWeights.bold};
   color: ${colors.primary[700]};
`;

export const UserEmail = styled.span`
   flex: 1;
   min-width: 0;
   overflow: hidden;
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.muted};
   white-space: nowrap;
   text-overflow: ellipsis;
`;

export const LogoutButton = styled.button`
   display: inline-flex;
   flex-shrink: 0;
   align-items: center;
   gap: ${theme.space[6]};
   min-height: ${theme.sizes.controlSmall};
   padding: 0 ${theme.space[8]};
   border: 0;
   border-radius: ${theme.rounded.md};
   background-color: transparent;
   font-family: inherit;
   font-size: ${theme.fontSizes.small};
   font-weight: ${theme.fontWeights.medium};
   color: ${colors.text.secondary};
   cursor: pointer;
   transition: background-color ${theme.durations.fast} ease-in-out;

   &:hover {
      background-color: ${colors.surface.hover};
      color: ${colors.text.primary};
   }

   &:active {
      background-color: ${colors.surface.border};
   }

   &:disabled {
      cursor: not-allowed;
      opacity: ${theme.opacities.disabled};
   }

   ${focusRing}
`;

export const ErrorText = styled.span`
   ${fieldError}
`;
