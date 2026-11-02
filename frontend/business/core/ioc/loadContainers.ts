import type { Container } from 'inversify';
import { loadAuthenticationContainer } from './containers/authentication.container';
import { loadCampaignContainer } from './containers/campaign.container';
import { loadLoggingContainer } from './containers/logging.container';
import { loadReferenceContainer } from './containers/reference.container';

// Agrega todos os loadXxxContainer. Toda feature nova registra o seu aqui (ver services-di-ioc.md).
export const loadContainers = (container: Container): void => {
   loadLoggingContainer(container);
   loadAuthenticationContainer(container);
   loadCampaignContainer(container);
   loadReferenceContainer(container);
};
