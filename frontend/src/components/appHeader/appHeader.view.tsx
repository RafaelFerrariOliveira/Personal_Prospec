import { Actions, ErrorText, Header, LogoutButton, UserEmail } from './appHeader.styles';
import type { IAppHeaderViewProps } from './appHeader.types';

const AppHeaderView = ({ email, isLoggingOut, isLogoutDisabled, errorMessage, onLogout }: IAppHeaderViewProps) => {
   return (
      <Header data-testid="app-header">
         <UserEmail data-testid="app-header-email">{email ?? 'Sem usuário'}</UserEmail>
         <Actions>
            {errorMessage && (
               <ErrorText role="alert" data-testid="app-header-error">
                  {errorMessage}
               </ErrorText>
            )}
            <LogoutButton type="button" data-testid="app-header-logout" disabled={isLogoutDisabled} onClick={onLogout}>
               {isLoggingOut ? 'Saindo...' : 'Sair'}
            </LogoutButton>
         </Actions>
      </Header>
   );
};

export default AppHeaderView;
