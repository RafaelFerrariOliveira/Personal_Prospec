import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { theme } from '@extensions/designSystem/themes';
import { ECampaignStatus } from '@enums/campaignStatus.enum';

type TBadgeTone = { color: string; background: string; dot: string };

// Cores do protótipo (statusInfo em Main.dc.html). Cancelada não existe no protótipo: usa o tom danger (decisão do Rafael).
const TONES: Record<ECampaignStatus, TBadgeTone> = {
   [ECampaignStatus.Draft]: { color: colors.text.strong, background: colors.surface.hover, dot: colors.zinc[400] },
   [ECampaignStatus.Running]: { color: colors.primary[700], background: colors.primary[50], dot: colors.primary[500] },
   [ECampaignStatus.Paused]: {
      color: colors.feedback.warning.fg,
      background: colors.feedback.warning.bg,
      dot: colors.feedback.warning.bar,
   },
   [ECampaignStatus.Completed]: {
      color: colors.feedback.success.fg,
      background: colors.feedback.success.bg,
      dot: colors.feedback.success.bar,
   },
   [ECampaignStatus.Cancelled]: {
      color: colors.feedback.danger.fg,
      background: colors.feedback.danger.bg,
      dot: colors.feedback.danger.bar,
   },
};

export const Badge = styled.span<{ $status: ECampaignStatus }>`
   display: inline-flex;
   align-items: center;
   gap: ${theme.space[6]};
   height: ${theme.sizes.badge};
   padding: 0 ${theme.space[10]};
   border-radius: ${theme.rounded.full};
   font-size: ${theme.fontSizes.caption};
   font-weight: ${theme.fontWeights.medium};
   white-space: nowrap;
   color: ${(props) => TONES[props.$status].color};
   background-color: ${(props) => TONES[props.$status].background};
`;

export const Dot = styled.span<{ $status: ECampaignStatus }>`
   width: ${theme.sizes.statusDot};
   height: ${theme.sizes.statusDot};
   border-radius: ${theme.rounded.full};
   background-color: ${(props) => TONES[props.$status].dot};
`;
