import { useCallback, useState } from 'react';
import { RoutePaths } from '@routes/routePaths';
import { clearSession } from '@store/reducers/session/sessionSlice';
import { clearUser } from '@store/reducers/user/userSlice';
import type { IAppHeaderController, IAppHeaderControllerDeps } from './appHeader.types';

const LOGOUT_ERROR_MESSAGE = 'Não foi possível sair. Tente novamente.';

const UseAppHeaderController = ({
   authenticationService,
   navigate,
   dispatch,
   email,
}: IAppHeaderControllerDeps): IAppHeaderController => {
   const [isLoggingOut, setIsLoggingOut] = useState(false);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);

   const onLogout = useCallback(async (): Promise<void> => {
      setIsLoggingOut(true);
      setErrorMessage(null);
      try {
         await authenticationService.logout();
         dispatch(clearSession());
         dispatch(clearUser());
         navigate(RoutePaths.login);
      } catch {
         // Falha ao sair: mantém a sessão local e avisa, para o usuário tentar de novo.
         setErrorMessage(LOGOUT_ERROR_MESSAGE);
         setIsLoggingOut(false);
      }
   }, [authenticationService, dispatch, navigate]);

   return { email, isLoggingOut, isLogoutDisabled: isLoggingOut || !email, errorMessage, onLogout };
};

export default UseAppHeaderController;
