import type { NavigateFunction } from 'react-router-dom';
import type { IAuthenticationService } from '@interfaces/authentication.interface';
import type { AppDispatch } from '@store/store';

export interface IAppHeaderControllerDeps {
   authenticationService: IAuthenticationService;
   navigate: NavigateFunction;
   dispatch: AppDispatch;
   email: string | null;
}

export interface IAppHeaderController {
   email: string | null;
   isLoggingOut: boolean;
   isLogoutDisabled: boolean;
   errorMessage: string | null;
   onLogout: () => Promise<void>;
}

export type IAppHeaderViewProps = IAppHeaderController;
