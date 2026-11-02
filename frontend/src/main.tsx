import 'reflect-metadata';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import '@ioc/ioc.config';
import { GlobalStyle } from '@extensions/designSystem/globalStyle';
import { theme } from '@extensions/designSystem/themes';
import RoutesApp from '@routes/RoutesApp';
import store from '@store/store';

const rootElement = document.getElementById('root');

if (!rootElement) {
   throw new Error('Elemento #root não encontrado em index.html.');
}

createRoot(rootElement).render(
   <StrictMode>
      <Provider store={store}>
         <ThemeProvider theme={theme}>
            <GlobalStyle />
            <RoutesApp />
         </ThemeProvider>
      </Provider>
   </StrictMode>,
);
