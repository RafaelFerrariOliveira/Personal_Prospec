import styled from 'styled-components';
import { colors } from '@extensions/designSystem/colors';
import {
   card,
   errorBox,
   fieldError,
   fieldHint,
   fieldInput,
   fieldLabel,
   fieldTextarea,
   pageSubtitle,
   pageTitle,
   primaryButton,
   secondaryButton,
   sectionTitle,
   textButton,
} from '@extensions/designSystem/formControls';
import { theme } from '@extensions/designSystem/themes';

export const Container = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[24]};
   width: 100%;
   max-width: ${theme.sizes.campaignFormMaxWidth};
`;

export const BackLink = styled.button`
   ${textButton}
   align-self: flex-start;
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

export const StepList = styled.ol`
   display: flex;
   flex-wrap: wrap;
   gap: ${theme.space[6]};
   margin: 0;
   padding: 0;
   list-style: none;
`;

export const StepItem = styled.li<{ $isCurrent: boolean }>`
   display: inline-flex;
   align-items: center;
   min-height: ${theme.sizes.controlSmall};
   padding: 0 ${theme.space[12]};
   border: ${theme.borderWidths.thin} solid
      ${(props) => (props.$isCurrent ? colors.primary[200] : colors.surface.border)};
   border-radius: ${theme.rounded.full};
   background-color: ${(props) => (props.$isCurrent ? colors.primary[50] : colors.surface.card)};
   font-size: ${theme.fontSizes.small};
   font-weight: ${theme.fontWeights.medium};
   color: ${(props) => (props.$isCurrent ? colors.primary[700] : colors.text.secondary)};
`;

export const Card = styled.form`
   ${card}
   display: flex;
   flex-direction: column;
`;

export const NoticeCard = styled.div`
   ${card}
   display: flex;
   flex-direction: column;
   align-items: flex-start;
   gap: ${theme.space[14]};
   padding: ${theme.space[24]};
`;

export const Section = styled.section`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[18]};
   padding: ${theme.space[24]};
   border-bottom: ${theme.borderWidths.thin} solid ${colors.surface.divider};
`;

export const SectionTitle = styled.h2`
   ${sectionTitle}
`;

export const Field = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[6]};
`;

export const Label = styled.label`
   ${fieldLabel}
`;

export const RequiredMark = styled.span`
   color: ${colors.feedback.error.fg};
`;

export const Input = styled.input`
   ${fieldInput}
`;

export const Textarea = styled.textarea`
   ${fieldTextarea}
`;

export const FieldError = styled.span`
   ${fieldError}
`;

export const FieldHint = styled.span`
   ${fieldHint}
`;

export const ErrorList = styled.ul`
   ${errorBox}
`;

export const Footer = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${theme.space[12]};
   padding: ${theme.space[18]} ${theme.space[24]};
   border-radius: 0 0 ${theme.rounded.card} ${theme.rounded.card};
   background-color: ${colors.surface.subtle};
`;

export const Actions = styled.div`
   display: flex;
   flex-wrap: wrap;
   justify-content: flex-end;
   gap: ${theme.space[8]};
`;

export const BackButton = styled.button`
   ${secondaryButton}
`;

export const PrimaryButton = styled.button`
   ${primaryButton}
`;
