import type { Meta, StoryObj } from '@storybook/react-vite';
import Loading from './loading';

const meta = {
   title: 'Components/Loading',
   component: Loading,
   args: {
      isLoading: true,
   },
} satisfies Meta<typeof Loading>;

export default meta;

type TStory = StoryObj<typeof meta>;

export const Default: TStory = {};

export const CustomLabel: TStory = {
   args: {
      label: 'Carregando dados',
   },
};

export const Hidden: TStory = {
   args: {
      isLoading: false,
   },
};
