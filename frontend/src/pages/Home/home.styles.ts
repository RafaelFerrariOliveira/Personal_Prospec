import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import {
   card,
   errorBox,
   pageSubtitle,
   pageTitle,
   primaryButton,
   sectionTitle,
   smallButton,
   textButton,
} from '@extensions/designSystem/formControls';
import { focusRing } from '@extensions/designSystem/focusRing';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[28]};
`;

export const PageHeader = styled.header`
   display: flex;
   flex-wrap: wrap;
   align-items: flex-end;
   justify-content: space-between;
   gap: ${theme.space[16]};
`;

export const Heading = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[6]};
`;

export const Title = styled.h1`
   ${pageTitle}
`;

export const Subtitle = styled.p`
   ${pageSubtitle}
`;

export const PrimaryButton = styled.button`
   ${primaryButton}
`;

export const StatGrid = styled.div`
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(${theme.sizes.statCardMinWidth}, 1fr));
   gap: ${theme.space[16]};
`;

export const StatCard = styled.div`
   ${card}
   display: flex;
   flex-direction: column;
   gap: ${theme.space[12]};
   padding: ${theme.space[20]};
`;

export const StatTop = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: ${theme.space[8]};
`;

export const StatLabel = styled.span`
   font-size: ${theme.fontSizes.small};
   font-weight: ${theme.fontWeights.medium};
   color: ${colors.text.secondary};
`;

export const StatIcon = styled.span<{ $tone: 'neutral' | 'primary' }>`
   display: flex;
   align-items: center;
   justify-content: center;
   width: ${theme.sizes.iconTile};
   height: ${theme.sizes.iconTile};
   border-radius: ${theme.rounded.md};
   background-color: ${(props) => (props.$tone === 'primary' ? colors.primary[50] : colors.surface.hover)};
   color: ${(props) => (props.$tone === 'primary' ? colors.primary[700] : colors.text.strong)};
`;

export const StatValue = styled.div`
   font-size: ${theme.fontSizes.statValue};
   font-weight: ${theme.fontWeights.bold};
   font-variant-numeric: tabular-nums;
   line-height: ${theme.lineHeights.compact};
   letter-spacing: ${theme.letterSpacings.tighter};
`;

export const RecentSection = styled.section`
   ${card}
   overflow: hidden;
`;

export const RecentHeader = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
   gap: ${theme.space[12]};
   padding: ${theme.space[14]} ${theme.space[20]};
`;

export const SectionTitle = styled.h2`
   ${sectionTitle}
`;

export const SeeAllButton = styled.button`
   ${textButton}
   padding: ${theme.space[8]} ${theme.space[4]};
   font-weight: ${theme.fontWeights.medium};
   color: ${colors.primary[600]};

   &:hover {
      color: ${colors.primary[700]};
   }
`;

export const RecentRow = styled.button`
   display: grid;
   grid-template-columns: minmax(0, 1fr) auto auto ${theme.sizes.iconMd};
   gap: ${theme.space[24]};
   align-items: center;
   width: 100%;
   padding: ${theme.space[14]} ${theme.space[20]};
   border: 0;
   border-top: ${theme.borderWidths.thin} solid ${colors.surface.divider};
   background-color: ${colors.surface.card};
   font-family: inherit;
   color: ${colors.text.primary};
   text-align: left;
   cursor: pointer;
   transition: background-color ${theme.durations.fast} ease-in-out;

   &:hover {
      background-color: ${colors.surface.subtle};
   }

   &:active {
      background-color: ${colors.surface.hover};
   }

   &:disabled {
      cursor: not-allowed;
      opacity: ${theme.opacities.disabled};
   }

   ${focusRing}
`;

export const RowMain = styled.span`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[2]};
   min-width: 0;
`;

export const RowName = styled.span`
   overflow: hidden;
   font-size: ${theme.fontSizes.base};
   font-weight: ${theme.fontWeights.bold};
   white-space: nowrap;
   text-overflow: ellipsis;
`;

export const RowMeta = styled.span`
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.muted};
`;

export const RowLocation = styled.span`
   font-size: ${theme.fontSizes.small};
   color: ${colors.text.strong};
   white-space: nowrap;
`;

export const RowChevron = styled.span`
   display: flex;
   color: ${colors.text.muted};
`;

export const Feedback = styled.p`
   margin: 0;
   padding: ${theme.space[14]} ${theme.space[20]};
   border-top: ${theme.borderWidths.thin} solid ${colors.surface.divider};
   font-size: ${theme.fontSizes.small};
   color: ${colors.text.secondary};
`;

export const ErrorBox = styled.div`
   display: flex;
   flex-wrap: wrap;
   align-items: center;
   gap: ${theme.space[12]};
`;

export const ErrorList = styled.ul`
   ${errorBox}
   flex: 1;
`;

export const RetryButton = styled.button`
   ${smallButton}
`;
