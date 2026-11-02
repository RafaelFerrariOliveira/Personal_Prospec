import type { NavigateFunction } from 'react-router-dom';
import type { TMenuPermissionKey } from '@access/types/permissionKeys';
import type { TIconName } from '@components/icon/icon.types';
import type { IAuthenticationService } from '@interfaces/authentication.interface';
import type { AppDispatch } from '@store/store';

export interface ISidebarControllerDeps {
   authenticationService: IAuthenticationService;
   navigate: NavigateFunction;
   dispatch: AppDispatch;
   email: string | null;
   pathname: string;
   canShowMenuItem: (menuKey: TMenuPermissionKey) => boolean;
}

export interface ISidebarNavItem {
   key: string;
   label: string;
   icon: TIconName;
   isCurrent: boolean;
   onSelect: () => void;
}

export interface ISidebarController {
   navItems: ISidebarNavItem[];
   email: string | null;
   avatarLetter: string;
   isLoggingOut: boolean;
   isLogoutDisabled: boolean;
   errorMessage: string | null;
   onLogout: () => Promise<void>;
}

export type ISidebarViewProps = ISidebarController;
