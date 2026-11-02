import Brand from '@components/brand/brand';
import Icon from '@components/icon/icon';
import { Aside, Avatar, ErrorText, Footer, LogoutButton, Nav, NavButton, UserEmail, UserRow } from './sidebar.styles';
import type { ISidebarViewProps } from './sidebar.types';

const SidebarView = ({
   navItems,
   email,
   avatarLetter,
   isLoggingOut,
   isLogoutDisabled,
   errorMessage,
   onLogout,
}: ISidebarViewProps) => {
   return (
      <Aside data-testid="sidebar">
         <Brand size="md" />
         <Nav aria-label="Navegação principal">
            {navItems.map((item) => (
               <NavButton
                  key={item.key}
                  type="button"
                  $isCurrent={item.isCurrent}
                  aria-current={item.isCurrent ? 'page' : undefined}
                  data-testid={`sidebar-nav-${item.key}`}
                  onClick={item.onSelect}
               >
                  <Icon name={item.icon} size="lg" />
                  {item.label}
               </NavButton>
            ))}
         </Nav>
         <Footer>
            <UserRow>
               <Avatar aria-hidden="true">{avatarLetter}</Avatar>
               <UserEmail data-testid="sidebar-email" title={email ?? undefined}>
                  {email ?? 'Sem usuário'}
               </UserEmail>
               <LogoutButton type="button" data-testid="sidebar-logout" disabled={isLogoutDisabled} onClick={onLogout}>
                  <Icon name="logout" size="md" />
                  {isLoggingOut ? 'Saindo...' : 'Sair'}
               </LogoutButton>
            </UserRow>
            {errorMessage && (
               <ErrorText role="alert" data-testid="sidebar-error">
                  {errorMessage}
               </ErrorText>
            )}
         </Footer>
      </Aside>
   );
};

export default SidebarView;
