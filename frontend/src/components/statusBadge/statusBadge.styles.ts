import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { theme } from '@extensions/designSystem/themes';
import { ECampaignStatus } from '@enums/campaignStatus.enum';

type TBadgeTone = { color: string; background: string };

const TONES: Record<ECampaignStatus, TBadgeTone> = {
   [ECampaignStatus.Draft]: { color: colors.text.secondary, background: colors.surface.hover },
   [ECampaignStatus.Running]: { color: colors.feedback.success.fg, background: colors.feedback.success.bg },
   [ECampaignStatus.Paused]: { color: colors.feedback.warning.fg, background: colors.feedback.warning.bg },
   [ECampaignStatus.Completed]: { color: colors.feedback.success.fg, background: colors.feedback.success.bg },
   [ECampaignStatus.Cancelled]: { color: colors.feedback.danger.fg, background: colors.feedback.danger.bg },
};

export const Badge = styled.span<{ $status: ECampaignStatus }>`
   display: inline-block;
   padding: ${theme.spacing.xs} ${theme.spacing.sm};
   border-radius: ${theme.rounded.full};
   font-family: ${theme.fontFamily};
   font-size: ${theme.fontSizes.caption};
   font-weight: ${theme.fontWeights.bold};
   color: ${(props) => TONES[props.$status].color};
   background-color: ${(props) => TONES[props.$status].background};
`;
