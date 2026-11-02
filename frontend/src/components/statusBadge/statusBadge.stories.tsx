import type { Meta, StoryObj } from '@storybook/react-vite';
import { ECampaignStatus } from '@enums/campaignStatus.enum';
import StatusBadge from './statusBadge';

const meta = {
   title: 'Components/StatusBadge',
   component: StatusBadge,
   args: { status: ECampaignStatus.Draft },
} satisfies Meta<typeof StatusBadge>;

export default meta;

type TStory = StoryObj<typeof meta>;

// Componente sem lógica e sem dados remotos: os estados padrão abaixo mostram o mesmo selo, sem variante própria.
export const Default: TStory = {};

export const Loading: TStory = {};

export const Empty: TStory = {};

export const Error: TStory = {};

export const Disabled: TStory = {};

export const Draft: TStory = { args: { status: ECampaignStatus.Draft } };

export const Running: TStory = { args: { status: ECampaignStatus.Running } };

export const Paused: TStory = { args: { status: ECampaignStatus.Paused } };

export const Completed: TStory = { args: { status: ECampaignStatus.Completed } };

export const Cancelled: TStory = { args: { status: ECampaignStatus.Cancelled } };
