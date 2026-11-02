import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import CnaeSearchInputView from './cnaeSearchInput.view';

const meta = {
   title: 'Components/CnaeSearchInput',
   component: CnaeSearchInputView,
   args: {
      term: '6201',
      results: [
         { code: '6201501', description: 'Desenvolvimento de programas de computador sob encomenda' },
         { code: '6201502', description: 'Web design' },
      ],
      selected: [{ code: '6203100', label: 'Desenvolvimento e licenciamento de programas de computador' }],
      isLoading: false,
      isEmpty: false,
      isDisabled: false,
      isLimitReached: false,
      hint: null,
      errorMessage: null,
      onTermChange: fn(),
      onSelect: fn(),
      onRemove: fn(),
   },
} satisfies Meta<typeof CnaeSearchInputView>;

export default meta;

type TStory = StoryObj<typeof meta>;

export const Default: TStory = {};

export const Loading: TStory = { args: { results: [], isLoading: true } };

export const Empty: TStory = { args: { term: 'zzzz', results: [], isEmpty: true } };

export const Error: TStory = {
   args: { results: [], errorMessage: 'Não foi possível buscar o CNAE. Tente novamente.' },
};

export const Disabled: TStory = { args: { isDisabled: true } };
