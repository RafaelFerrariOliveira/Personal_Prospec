import { expect, test } from '@playwright/test';

// Credenciais só por variável de ambiente (nunca no repositório): E2E_EMAIL e E2E_PASSWORD.
const email = process.env['E2E_EMAIL'];
const password = process.env['E2E_PASSWORD'];

test.describe('Login (API real) @real-api', () => {
   test.skip(!email || !password, 'Defina E2E_EMAIL e E2E_PASSWORD para rodar contra a API real.');

   test('entra, vê a Home e sai', async ({ page }) => {
      await page.goto('/');

      await page.getByTestId('login-email').fill(email ?? '');
      await page.getByTestId('login-password').fill(password ?? '');
      await page.getByTestId('login-submit').click();

      await expect(page).toHaveURL('/home');
      await expect(page.getByTestId('app-header-email')).toBeVisible();

      await page.getByTestId('app-header-logout').click();
      await expect(page.getByTestId('login')).toBeVisible();
   });
});
