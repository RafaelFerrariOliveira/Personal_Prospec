import { useNavigate } from 'react-router-dom';
import { useInjection } from '@hooks/useInjection';
import type { IAuthenticationService } from '@interfaces/authentication.interface';
import { AuthenticationServiceSymbol } from '@ioc/references/authentication.symbols';
import { selectUser } from '@store/reducers/user/userSlice';
import { useAppDispatch, useAppSelector } from '@store/store';
import UseAppHeaderController from './appHeader.controller';
import AppHeaderView from './appHeader.view';

const AppHeader = () => {
   const authenticationService = useInjection<IAuthenticationService>(AuthenticationServiceSymbol);
   const navigate = useNavigate();
   const dispatch = useAppDispatch();
   const user = useAppSelector(selectUser);
   const controller = UseAppHeaderController({ authenticationService, navigate, dispatch, email: user?.email ?? null });

   return <AppHeaderView {...controller} />;
};

export default AppHeader;
