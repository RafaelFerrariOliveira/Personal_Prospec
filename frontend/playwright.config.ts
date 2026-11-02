import { defineConfig, devices } from '@playwright/test';

/**
 * Ver https://playwright.dev/docs/test-configuration.
 * Specs marcados com @real-api batem na API real e só rodam em test:e2e:real-api; o resto intercepta a API via page.route.
 */
export default defineConfig({
   testDir: './tests/e2e',
   fullyParallel: true,
   forbidOnly: !!process.env['CI'],
   retries: process.env['CI'] ? 2 : 0,
   workers: 2,
   reporter: 'list',
   use: {
      baseURL: 'http://localhost:5173',
      locale: 'pt-BR',
      permissions: [],
   },
   projects: [
      {
         name: 'chromium',
         use: { ...devices['Desktop Chrome'] },
         grepInvert: /@real-api/,
      },
      {
         name: 'chromium-real-api',
         use: { ...devices['Desktop Chrome'] },
         grep: /@real-api/,
      },
   ],
   webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
   },
});
