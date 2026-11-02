import type { Container } from 'inversify';
import { loadAuthenticationContainer } from './containers/authentication.container';
import { loadLoggingContainer } from './containers/logging.container';

// Agrega todos os loadXxxContainer. Toda feature nova registra o seu aqui (ver services-di-ioc.md).
export const loadContainers = (container: Container): void => {
   loadLoggingContainer(container);
   loadAuthenticationContainer(container);
};
