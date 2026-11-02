import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import {
   card,
   errorBox,
   pageTitle,
   sectionTitle,
   smallButton,
   textButton,
} from '@extensions/designSystem/formControls';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[24]};
`;

export const Breadcrumb = styled.nav`
   display: flex;
   align-items: center;
   gap: ${theme.space[6]};
   min-width: 0;
   font-size: ${theme.fontSizes.small};
   color: ${colors.text.muted};
`;

export const BackLink = styled.button`
   ${textButton}
   flex-shrink: 0;
`;

export const BreadcrumbCurrent = styled.span`
   overflow: hidden;
   font-weight: ${theme.fontWeights.medium};
   color: ${colors.text.primary};
   white-space: nowrap;
   text-overflow: ellipsis;
`;

export const Header = styled.header`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[12]};
`;

export const TitleRow = styled.div`
   display: flex;
   flex-wrap: wrap;
   align-items: center;
   gap: ${theme.space[12]};
`;

export const Title = styled.h1`
   ${pageTitle}
`;

export const Objective = styled.p`
   max-width: ${theme.sizes.descriptionMaxWidth};
   margin: 0;
   font-size: ${theme.fontSizes.sectionTitle};
   color: ${colors.text.strong};
   overflow-wrap: anywhere;
`;

export const MetaRow = styled.div`
   display: flex;
   flex-wrap: wrap;
   gap: ${theme.space[8]} ${theme.space[22]};
   font-size: ${theme.fontSizes.small};
   color: ${colors.text.secondary};
`;

export const MetaItem = styled.span`
   display: inline-flex;
   align-items: center;
   gap: ${theme.space[6]};
`;

export const Card = styled.section`
   ${card}
   display: flex;
   flex-direction: column;
   gap: ${theme.space[14]};
   padding: ${theme.space[20]} ${theme.space[22]};
`;

export const ProgressHeader = styled.div`
   display: flex;
   align-items: center;
   gap: ${theme.space[14]};
   min-width: 0;
`;

export const ProgressIcon = styled.span`
   display: flex;
   flex-shrink: 0;
   align-items: center;
   justify-content: center;
   width: ${theme.sizes.iconTileLarge};
   height: ${theme.sizes.iconTileLarge};
   border-radius: ${theme.rounded.box};
   background-color: ${colors.surface.hover};
   color: ${colors.text.strong};
`;

export const ProgressTexts = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[2]};
   min-width: 0;
`;

export const ProgressTitle = styled.span`
   font-size: ${theme.fontSizes.sectionTitle};
   font-weight: ${theme.fontWeights.bold};
`;

export const ProgressSub = styled.span`
   font-size: ${theme.fontSizes.small};
   color: ${colors.text.secondary};
`;

export const SectionTitle = styled.h2`
   ${sectionTitle}
`;

export const DetailList = styled.dl`
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(${theme.sizes.fieldGridMinWidth}, 1fr));
   gap: ${theme.space[18]};
   margin: 0;
`;

export const DetailItem = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[2]};
`;

export const Term = styled.dt`
   font-size: ${theme.fontSizes.caption};
   color: ${colors.text.muted};
`;

export const Value = styled.dd`
   margin: 0;
   font-size: ${theme.fontSizes.base};
   color: ${colors.text.primary};
   overflow-wrap: anywhere;
`;

export const NoticeCard = styled.div`
   ${card}
   display: flex;
   flex-direction: column;
   align-items: flex-start;
   gap: ${theme.space[14]};
   padding: ${theme.space[24]};
   font-size: ${theme.fontSizes.base};
`;

export const ErrorList = styled.ul`
   ${errorBox}
`;

export const ActionButton = styled.button`
   ${smallButton}
`;
