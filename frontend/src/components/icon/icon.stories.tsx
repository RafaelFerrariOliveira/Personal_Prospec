import type { Meta, StoryObj } from '@storybook/react-vite';
import Icon from './icon';

const meta = {
   title: 'Components/Icon',
   component: Icon,
   args: { name: 'sparkle', size: 'md' },
} satisfies Meta<typeof Icon>;

export default meta;

type TStory = StoryObj<typeof meta>;

// Componente sem lógica nem dados: os estados padrão mostram o mesmo ícone, sem variante própria.
export const Default: TStory = {};

export const Loading: TStory = { args: { name: 'robot' } };

export const Empty: TStory = { args: { name: 'target' } };

export const Error: TStory = { args: { name: 'stop' } };

export const Disabled: TStory = { args: { name: 'pause' } };

export const Hero: TStory = { args: { name: 'sparkle', size: 'hero' } };
