import type { Container } from 'inversify';
import { AuthenticationService } from '@application/service/authentication.service';
import type { IAuthenticationService } from '@interfaces/authentication.interface';
import { AuthenticationServiceSymbol } from '@ioc/references/authentication.symbols';

export const loadAuthenticationContainer = (container: Container): void => {
   container.bind<IAuthenticationService>(AuthenticationServiceSymbol).to(AuthenticationService);
};
