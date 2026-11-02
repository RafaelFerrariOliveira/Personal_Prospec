import { Container } from 'inversify';
import { loadContainers } from './loadContainers';

export const containerIoC = new Container({ defaultScope: 'Singleton' });

loadContainers(containerIoC);

export const resolveContainer = <T>(symbol: symbol): T => containerIoC.get<T>(symbol);
