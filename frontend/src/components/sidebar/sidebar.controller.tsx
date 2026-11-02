import { useCallback, useState } from 'react';
import { PermissionKeys, type TMenuPermissionKey } from '@access/types/permissionKeys';
import type { TIconName } from '@components/icon/icon.types';
import { RoutePaths } from '@routes/routePaths';
import { clearSession } from '@store/reducers/session/sessionSlice';
import { clearUser } from '@store/reducers/user/userSlice';
import type { ISidebarController, ISidebarControllerDeps } from './sidebar.types';

const LOGOUT_ERROR_MESSAGE = 'Não foi possível sair. Tente novamente.';

interface IMenuEntry {
   key: string;
   label: string;
   icon: TIconName;
   path: string;
   permission: TMenuPermissionKey;
   isCurrent: (pathname: string) => boolean;
}

// Itens do menu lateral. Empresas entra com a spec própria; cada item passa pela policy de menu.
const MENU: IMenuEntry[] = [
   {
      key: 'home',
      label: 'Home',
      icon: 'home',
      path: RoutePaths.home,
      permission: PermissionKeys.menu.home,
      isCurrent: (pathname) => pathname === RoutePaths.home,
   },
   {
      key: 'campaigns',
      label: 'Campanhas',
      icon: 'target',
      path: RoutePaths.campaigns,
      permission: PermissionKeys.menu.campaigns,
      isCurrent: (pathname) => pathname === RoutePaths.campaigns || pathname.startsWith(`${RoutePaths.campaigns}/`),
   },
];

const UseSidebarController = ({
   authenticationService,
   navigate,
   dispatch,
   email,
   pathname,
   canShowMenuItem,
}: ISidebarControllerDeps): ISidebarController => {
   const [isLoggingOut, setIsLoggingOut] = useState(false);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);

   const onLogout = useCallback(async (): Promise<void> => {
      setIsLoggingOut(true);
      setErrorMessage(null);
      try {
         await authenticationService.logout();
         dispatch(clearSession());
         dispatch(clearUser());
         void navigate(RoutePaths.login);
      } catch {
         // Falha ao sair: mantém a sessão local e avisa, para o usuário tentar de novo.
         setErrorMessage(LOGOUT_ERROR_MESSAGE);
         setIsLoggingOut(false);
      }
   }, [authenticationService, dispatch, navigate]);

   const navItems = MENU.filter((entry) => canShowMenuItem(entry.permission)).map((entry) => ({
      key: entry.key,
      label: entry.label,
      icon: entry.icon,
      isCurrent: entry.isCurrent(pathname),
      onSelect: () => {
         void navigate(entry.path);
      },
   }));

   return {
      navItems,
      email,
      avatarLetter: email ? email.charAt(0).toUpperCase() : '',
      isLoggingOut,
      isLogoutDisabled: isLoggingOut || !email,
      errorMessage,
      onLogout,
   };
};

export default UseSidebarController;
