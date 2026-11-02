import type { Meta, StoryObj } from '@storybook/react-vite';
import Brand from './brand';

const meta = {
   title: 'Components/Brand',
   component: Brand,
   args: { size: 'md' },
} satisfies Meta<typeof Brand>;

export default meta;

type TStory = StoryObj<typeof meta>;

// Componente sem lógica nem dados: os estados padrão mostram a mesma marca, sem variante própria.
export const Default: TStory = {};

export const Loading: TStory = {};

export const Empty: TStory = {};

export const Error: TStory = {};

export const Disabled: TStory = {};

export const Login: TStory = { args: { size: 'lg' } };
