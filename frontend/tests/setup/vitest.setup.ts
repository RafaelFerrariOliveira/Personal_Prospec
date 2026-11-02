import 'reflect-metadata';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Sem globals do Vitest o Testing Library não desmonta sozinho entre testes.
afterEach(cleanup);

// O jsdom não implementa estas APIs do navegador: stubs para componentes responsivos e scroll infinito.
vi.stubGlobal(
   'matchMedia',
   vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
   })),
);

vi.stubGlobal(
   'ResizeObserver',
   vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
   })),
);

vi.stubGlobal(
   'IntersectionObserver',
   vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => []),
      root: null,
      rootMargin: '',
      thresholds: [],
   })),
);
