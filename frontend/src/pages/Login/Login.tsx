import { useNavigate } from 'react-router-dom';
import { useInjection } from '@hooks/useInjection';
import type { IAuthenticationService } from '@interfaces/authentication.interface';
import { AuthenticationServiceSymbol } from '@ioc/references/authentication.symbols';
import { useAppDispatch } from '@store/store';
import UseLoginController from './Login.controller';
import LoginView from './Login.view';

const Login = () => {
   const authenticationService = useInjection<IAuthenticationService>(AuthenticationServiceSymbol);
   const navigate = useNavigate();
   const dispatch = useAppDispatch();
   const controller = UseLoginController({ authenticationService, navigate, dispatch });

   return <LoginView {...controller} />;
};

export default Login;
