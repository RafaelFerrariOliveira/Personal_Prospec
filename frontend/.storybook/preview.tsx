import 'reflect-metadata';
import type { Preview } from '@storybook/react-vite';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from '../src/extensions/designSystem/themes';
import store from '../src/stores/store';

const preview: Preview = {
   decorators: [
      (Story) => (
         <Provider store={store}>
            <ThemeProvider theme={theme}>
               <BrowserRouter>
                  <Story />
               </BrowserRouter>
            </ThemeProvider>
         </Provider>
      ),
   ],
   parameters: {
      controls: {
         matchers: {
            color: /(background|color)$/i,
            date: /Date$/i,
         },
      },
      a11y: {
         // 'todo': mostra violações só na UI de teste; 'error': falha o CI; 'off': desliga.
         test: 'todo',
      },
   },
};

export default preview;
