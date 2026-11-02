import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { focusRing } from '@extensions/designSystem/focusRing';
import { theme } from '@extensions/designSystem/themes';

export const Header = styled.header`
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: ${theme.spacing.md};
   padding: ${theme.spacing.sm} ${theme.spacing.md};
   border-bottom: ${theme.borderWidths.thin} solid ${colors.neutro.gray[300]};
   background-color: ${colors.neutro.white};
`;

export const UserEmail = styled.span`
   font-size: ${theme.fontSizes.body};
   color: ${colors.neutro.gray[700]};
`;

export const Actions = styled.div`
   display: flex;
   align-items: center;
   gap: ${theme.spacing.md};
`;

export const ErrorText = styled.span`
   font-size: ${theme.fontSizes.caption};
   color: ${colors.neutro.gray[900]};
`;

export const LogoutButton = styled.button`
   padding: ${theme.spacing.sm} ${theme.spacing.lg};
   border: ${theme.borderWidths.thin} solid ${colors.neutro.gray[800]};
   border-radius: ${theme.rounded.md};
   background-color: ${colors.neutro.white};
   color: ${colors.neutro.gray[900]};
   font-size: ${theme.fontSizes.button};
   font-weight: ${theme.fontWeights.bold};
   cursor: pointer;
   transition: background-color ${theme.durations.fast} ease-in-out;

   &:hover {
      background-color: ${colors.neutro.gray[200]};
   }

   &:active {
      background-color: ${colors.neutro.gray[300]};
   }

   &:disabled {
      cursor: not-allowed;
      opacity: ${theme.opacities.disabled};
   }

   ${focusRing}
`;
