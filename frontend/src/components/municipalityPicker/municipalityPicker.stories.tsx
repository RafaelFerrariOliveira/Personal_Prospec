import type { Meta, StoryObj } from '@storybook/react-vite';
import { createRef } from 'react';
import { fn } from 'storybook/test';
import MunicipalityPickerView from './municipalityPicker.view';

const meta = {
   title: 'Components/MunicipalityPicker',
   component: MunicipalityPickerView,
   args: {
      states: [
         { code: 'SP', name: 'SAO PAULO' },
         { code: 'RJ', name: 'RIO DE JANEIRO' },
      ],
      stateCode: 'SP',
      term: '',
      cities: [
         { code: '7107', name: 'SAO PAULO', isSelected: true },
         { code: '6291', name: 'CAMPINAS', isSelected: false },
      ],
      selected: [{ code: '7107', label: 'SAO PAULO' }],
      isLoadingStates: false,
      isLoadingFirstPage: false,
      isLoadingMore: false,
      hasMore: false,
      isEmpty: false,
      isLimitReached: false,
      isDisabled: false,
      loadErrorMessage: null,
      fieldErrorMessage: null,
      listRef: createRef<HTMLUListElement>(),
      sentinelRef: fn(),
      onStateChange: fn(),
      onTermChange: fn(),
      onToggle: fn(),
      onRemove: fn(),
      onRetry: fn(),
   },
} satisfies Meta<typeof MunicipalityPickerView>;

export default meta;

type TStory = StoryObj<typeof meta>;

export const Default: TStory = {};

export const Loading: TStory = { args: { cities: [], selected: [], isLoadingFirstPage: true } };

export const Empty: TStory = { args: { cities: [], selected: [], isEmpty: true, term: 'zzzz' } };

export const Error: TStory = {
   args: { cities: [], selected: [], loadErrorMessage: 'Não foi possível carregar as cidades. Tente novamente.' },
};

export const Disabled: TStory = { args: { isDisabled: true } };

export const FieldError: TStory = {
   args: { selected: [], fieldErrorMessage: 'Escolha ao menos uma cidade.' },
};
