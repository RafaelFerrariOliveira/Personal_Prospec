import { expect, test, type Page } from '@playwright/test';

const EMAIL = 'usuario@exemplo.com';
const PASSWORD_ERROR_MESSAGE = 'E-mail ou senha inválidos.';

// API mockada com estado mínimo: logado ou não, como o cookie httpOnly faria no backend real.
const mockApi = async (page: Page, options: { acceptLogin: boolean }): Promise<void> => {
   let isLoggedIn = false;

   await page.route('**/api/Antiforgery/token', (route) => route.fulfill({ json: { token: 'csrf-e2e' } }));

   await page.route('**/api/Authentication/get_session', (route) =>
      isLoggedIn ? route.fulfill({ json: { email: EMAIL } }) : route.fulfill({ status: 401 }),
   );

   await page.route('**/api/Authentication/refresh_token', (route) =>
      route.fulfill({ status: 400, json: [{ key: 'RefreshToken', value: 'Sessão expirada.' }] }),
   );

   await page.route('**/api/Authentication/generate_access_token', (route) => {
      if (!options.acceptLogin) {
         return route.fulfill({ status: 400, json: [{ key: 'Login', value: PASSWORD_ERROR_MESSAGE }] });
      }
      isLoggedIn = true;
      return route.fulfill({ json: true });
   });

   // A Home lê os indicadores da lista de campanhas.
   await page.route('**/api/Campaign/get_all_with_pagination_campaign**', (route) =>
      route.fulfill({ json: { items: [], totalCount: 0, pageNumber: 1, pageSize: 5, totalPages: 0 } }),
   );

   await page.route('**/api/Authentication/logout', (route) => {
      isLoggedIn = false;
      return route.fulfill({ json: true });
   });
};

const fillLogin = async (page: Page, password: string): Promise<void> => {
   await page.getByTestId('login-email').fill(EMAIL);
   await page.getByTestId('login-password').fill(password);
   await page.getByTestId('login-submit').click();
};

test.describe('Login (API mockada)', () => {
   test('rota interna sem sessão redireciona para o login', async ({ page }) => {
      await mockApi(page, { acceptLogin: true });

      await page.goto('/home');

      await expect(page.getByTestId('login')).toBeVisible();
      await expect(page).toHaveURL('/');
   });

   test('login correto chega à Home', async ({ page }) => {
      await mockApi(page, { acceptLogin: true });
      await page.goto('/');

      await fillLogin(page, 'senha-correta');

      await expect(page).toHaveURL('/home');
      await expect(page.getByTestId('home')).toBeVisible();
      await expect(page.getByTestId('sidebar-email')).toHaveText(EMAIL);
   });

   test('senha errada mostra a mensagem e permanece no login', async ({ page }) => {
      await mockApi(page, { acceptLogin: false });
      await page.goto('/');

      await fillLogin(page, 'senha-errada');

      await expect(page.getByTestId('login-submit-errors')).toContainText(PASSWORD_ERROR_MESSAGE);
      await expect(page).toHaveURL('/');
   });

   test('sair volta ao login', async ({ page }) => {
      await mockApi(page, { acceptLogin: true });
      await page.goto('/');
      await fillLogin(page, 'senha-correta');
      await expect(page.getByTestId('home')).toBeVisible();

      await page.getByTestId('sidebar-logout').click();

      await expect(page.getByTestId('login')).toBeVisible();
      await expect(page).toHaveURL('/');
   });
});
