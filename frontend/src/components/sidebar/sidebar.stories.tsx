import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import SidebarView from './sidebar.view';

const meta = {
   title: 'Components/Sidebar',
   component: SidebarView,
   args: {
      navItems: [
         { key: 'home', label: 'Home', icon: 'home', isCurrent: true, onSelect: fn() },
         { key: 'campaigns', label: 'Campanhas', icon: 'target', isCurrent: false, onSelect: fn() },
      ],
      email: 'usuario@exemplo.com',
      avatarLetter: 'U',
      isLoggingOut: false,
      isLogoutDisabled: false,
      errorMessage: null,
      onLogout: fn(),
   },
} satisfies Meta<typeof SidebarView>;

export default meta;

type TStory = StoryObj<typeof meta>;

export const Default: TStory = {};

export const Loading: TStory = { args: { isLoggingOut: true, isLogoutDisabled: true } };

export const Empty: TStory = { args: { navItems: [], email: null, avatarLetter: '', isLogoutDisabled: true } };

export const Error: TStory = { args: { errorMessage: 'Não foi possível sair. Tente novamente.' } };

export const Disabled: TStory = { args: { isLogoutDisabled: true } };
