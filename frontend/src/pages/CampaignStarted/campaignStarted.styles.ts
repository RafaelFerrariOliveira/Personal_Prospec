import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import { errorBox, primaryButton, secondaryButton } from '@extensions/designSystem/formControls';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.div`
   display: flex;
   justify-content: center;
   padding: ${theme.space[32]} 0;
`;

export const Card = styled.section`
   display: flex;
   flex-direction: column;
   align-items: center;
   gap: ${theme.space[20]};
   width: 100%;
   max-width: ${theme.sizes.agentCardMaxWidth};
   padding: ${theme.space[40]} ${theme.space[36]};
   border: ${theme.borderWidths.thin} solid ${colors.surface.border};
   border-radius: ${theme.rounded.hero};
   background-color: ${colors.surface.card};
   box-shadow: ${theme.shadows.raised};
   text-align: center;
`;

export const Orb = styled.span`
   display: flex;
   align-items: center;
   justify-content: center;
   width: ${theme.sizes.agentOrb};
   height: ${theme.sizes.agentOrb};
   border-radius: ${theme.rounded.full};
   background-color: ${colors.primary[600]};
   box-shadow: ${theme.shadows.agentOrb};
   color: ${colors.neutro.white};
`;

export const SuccessPill = styled.span`
   display: inline-flex;
   align-items: center;
   gap: ${theme.space[6]};
   height: ${theme.sizes.badge};
   padding: 0 ${theme.space[10]};
   border-radius: ${theme.rounded.full};
   background-color: ${colors.feedback.success.bg};
   font-size: ${theme.fontSizes.caption};
   font-weight: ${theme.fontWeights.medium};
   color: ${colors.feedback.success.fg};
`;

export const Heading = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[8]};
`;

export const Title = styled.h1`
   margin: 0;
   font-size: ${theme.fontSizes.cardTitle};
   font-weight: ${theme.fontWeights.bold};
   letter-spacing: ${theme.letterSpacings.tighter};
`;

export const Subtitle = styled.p`
   margin: 0;
   font-size: ${theme.fontSizes.sectionTitle};
   color: ${colors.text.secondary};
`;

export const InfoBox = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[2]};
   width: 100%;
   padding: ${theme.space[12]} ${theme.space[14]};
   border: ${theme.borderWidths.thin} solid ${colors.surface.divider};
   border-radius: ${theme.rounded.box};
   background-color: ${colors.surface.subtle};
   text-align: left;
`;

export const InfoLabel = styled.span`
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.muted};
`;

export const InfoName = styled.span`
   font-size: ${theme.fontSizes.base};
   font-weight: ${theme.fontWeights.bold};
   overflow-wrap: anywhere;
`;

export const InfoMeta = styled.span`
   display: flex;
   flex-wrap: wrap;
   gap: ${theme.space[4]};
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.secondary};
`;

export const Hint = styled.p`
   margin: 0;
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.muted};
`;

export const Text = styled.p`
   margin: 0;
   font-size: ${theme.fontSizes.base};
`;

export const ErrorList = styled.ul`
   ${errorBox}
   width: 100%;
   text-align: left;
`;

export const PrimaryButton = styled.button`
   ${primaryButton}
   box-shadow: none;
`;

export const SecondaryButton = styled.button`
   ${secondaryButton}
`;
