import { useLocation, useNavigate } from 'react-router-dom';
import { useAccessControl } from '@access/hooks/useAccessControl';
import { useInjection } from '@hooks/useInjection';
import type { IAuthenticationService } from '@interfaces/authentication.interface';
import { AuthenticationServiceSymbol } from '@ioc/references/authentication.symbols';
import { selectUser } from '@store/reducers/user/userSlice';
import { useAppDispatch, useAppSelector } from '@store/store';
import UseSidebarController from './sidebar.controller';
import SidebarView from './sidebar.view';

const Sidebar = () => {
   const authenticationService = useInjection<IAuthenticationService>(AuthenticationServiceSymbol);
   const navigate = useNavigate();
   const { pathname } = useLocation();
   const dispatch = useAppDispatch();
   const user = useAppSelector(selectUser);
   const { canShowMenuItem } = useAccessControl();
   const controller = UseSidebarController({
      authenticationService,
      navigate,
      dispatch,
      email: user?.email ?? null,
      pathname,
      canShowMenuItem,
   });

   return <SidebarView {...controller} />;
};

export default Sidebar;
