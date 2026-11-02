import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAccessControl } from '@access/hooks/useAccessControl';
import AppHeader from '@components/appHeader/AppHeader';
import Loading from '@components/loading/loading';
import { useInjection } from '@hooks/useInjection';
import { useSessionBootstrap } from '@hooks/useSessionBootstrap';
import type { IAuthenticationService } from '@interfaces/authentication.interface';
import { AuthenticationServiceSymbol } from '@ioc/references/authentication.symbols';
import { RoutePaths } from '@routes/routePaths';
import { selectIsSessionBootstrapped } from '@store/reducers/session/sessionSlice';
import { selectUser } from '@store/reducers/user/userSlice';
import { useAppDispatch, useAppSelector } from '@store/store';

/** Guarda de toda rota privada (ver react-router.md): bootstrap, Loading, login sem usuário, acesso e Outlet. */
const AuthRequiredRoutes = () => {
   const authenticationService = useInjection<IAuthenticationService>(AuthenticationServiceSymbol);
   const dispatch = useAppDispatch();
   const location = useLocation();
   const isSessionBootstrapped = useAppSelector(selectIsSessionBootstrapped);
   const user = useAppSelector(selectUser);
   const { bootstrapSession } = useSessionBootstrap(authenticationService, dispatch);
   const { canAccessRoute } = useAccessControl();
   const isBootstrapping = useRef(false);

   useEffect(() => {
      if (isSessionBootstrapped || isBootstrapping.current) return;
      isBootstrapping.current = true;
      const run = async (): Promise<void> => {
         try {
            await bootstrapSession();
         } catch {
            // Falha já deixou o usuário limpo e a sessão marcada: a guarda redireciona ao login.
         } finally {
            isBootstrapping.current = false;
         }
      };
      void run();
   }, [isSessionBootstrapped, bootstrapSession]);

   if (!isSessionBootstrapped) return <Loading isLoading={true} />;
   if (!user) return <Navigate to={RoutePaths.login} replace />;
   if (!canAccessRoute(location.pathname)) return <Navigate to={RoutePaths.home} replace />;

   return (
      <>
         <AppHeader />
         <Outlet />
      </>
   );
};

export default AuthRequiredRoutes;
