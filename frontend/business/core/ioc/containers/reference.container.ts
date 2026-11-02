import type { Container } from 'inversify';
import { ReferenceService } from '@application/service/reference.service';
import type { IReferenceService } from '@interfaces/reference.interface';
import { ReferenceServiceSymbol } from '@ioc/references/reference.symbols';

export const loadReferenceContainer = (container: Container): void => {
   container.bind<IReferenceService>(ReferenceServiceSymbol).to(ReferenceService);
};
