import { ActionButton, Container, Description, Title } from './home.styles';
import type { IHomeViewProps } from './Home.types';

const HomeView = ({
   title,
   description,
   actionLabel,
   onAction,
   canShowCampaigns,
   campaignsLabel,
   onOpenCampaigns,
}: IHomeViewProps) => {
   return (
      <Container data-testid="home">
         <Title>{title}</Title>
         <Description>{description}</Description>
         <ActionButton type="button" data-testid="home-action" onClick={onAction}>
            {actionLabel}
         </ActionButton>
         {canShowCampaigns && (
            <ActionButton type="button" data-testid="home-campaigns" onClick={onOpenCampaigns}>
               {campaignsLabel}
            </ActionButton>
         )}
      </Container>
   );
};

export default HomeView;
