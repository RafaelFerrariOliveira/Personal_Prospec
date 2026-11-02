import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import CampaignHistoryView from './campaignHistory.view';

const meta = {
   title: 'Components/CampaignHistory',
   component: CampaignHistoryView,
   args: {
      items: [
         {
            key: 'a',
            title: 'Campanha iniciada',
            description: 'Campanha iniciada.',
            occurredAtLabel: '02/11/2026 10:30:00',
         },
         {
            key: 'b',
            title: 'Campanha criada',
            description: 'Campanha criada.',
            occurredAtLabel: '02/11/2026 10:00:00',
         },
      ],
      isLoadingFirstPage: false,
      isLoadingMore: false,
      hasMore: false,
      isEmpty: false,
      errorMessage: null,
      sentinelRef: fn(),
      onRetry: fn(),
   },
} satisfies Meta<typeof CampaignHistoryView>;

export default meta;

type TStory = StoryObj<typeof meta>;

export const Default: TStory = {};

export const Loading: TStory = { args: { items: [], isLoadingFirstPage: true } };

export const Empty: TStory = { args: { items: [], isEmpty: true } };

export const Error: TStory = {
   args: { items: [], errorMessage: 'Não foi possível carregar o histórico. Tente novamente.' },
};

// Sem ação possível no histórico: o estado desabilitado é a lista com carregamento de mais itens em andamento.
export const Disabled: TStory = { args: { hasMore: true, isLoadingMore: true } };
