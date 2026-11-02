import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import AppHeaderView from './appHeader.view';

const meta = {
   title: 'Components/AppHeader',
   component: AppHeaderView,
   args: {
      email: 'usuario@exemplo.com',
      isLoggingOut: false,
      isLogoutDisabled: false,
      errorMessage: null,
      onLogout: fn(),
   },
} satisfies Meta<typeof AppHeaderView>;

export default meta;

type TStory = StoryObj<typeof meta>;

export const Default: TStory = {};

export const Loading: TStory = {
   args: { isLoggingOut: true, isLogoutDisabled: true },
};

export const Empty: TStory = {
   args: { email: null, isLogoutDisabled: true },
};

export const Error: TStory = {
   args: { errorMessage: 'Não foi possível sair. Tente novamente.' },
};

export const Disabled: TStory = {
   args: { isLogoutDisabled: true },
};
