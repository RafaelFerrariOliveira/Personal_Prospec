import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import CampaignActionsView from './campaignActions.view';

const meta = {
   title: 'Components/CampaignActions',
   component: CampaignActionsView,
   args: {
      canStart: true,
      canPause: false,
      canResume: false,
      canCancel: true,
      canEdit: true,
      isBusy: false,
      isConfirmingCancel: false,
      editBlockedHint: null,
      errorMessages: [],
      onStart: fn(),
      onPause: fn(),
      onResume: fn(),
      onEdit: fn(),
      onRequestCancel: fn(),
      onConfirmCancel: fn(),
      onDismissCancel: fn(),
   },
} satisfies Meta<typeof CampaignActionsView>;

export default meta;

type TStory = StoryObj<typeof meta>;

export const Default: TStory = {};

export const Loading: TStory = { args: { isBusy: true } };

// Campanha concluída ou cancelada: nenhuma ação disponível.
export const Empty: TStory = { args: { canStart: false, canCancel: false, canEdit: false } };

export const Error: TStory = {
   args: { errorMessages: ['Não foi possível concluir a ação. Tente novamente em instantes.'] },
};

export const Disabled: TStory = {
   args: {
      canStart: false,
      canPause: true,
      canEdit: false,
      editBlockedHint: 'Só é possível editar em Rascunho ou Pausada. Pause a campanha antes de editar.',
   },
};

export const ConfirmingCancel: TStory = { args: { isConfirmingCancel: true } };
