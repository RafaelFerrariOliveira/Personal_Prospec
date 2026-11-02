import { expect, test, type Page } from '@playwright/test';

const EMAIL = 'usuario@exemplo.com';
const ID_A = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';
const ID_B = '4f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6c';

const item = (id: string, name: string, status: string) => ({
   id,
   name,
   segment: 'Tecnologia',
   locationSummary: 'SP, 3 cidades',
   status,
   createdAt: '2026-11-02T10:00:00Z',
});

const pageOf = (items: unknown[]) => ({ items, totalCount: items.length, pageNumber: 1, pageSize: 20, totalPages: 1 });

const mockSession = async (page: Page): Promise<void> => {
   await page.route('**/api/Antiforgery/token', (route) => route.fulfill({ json: { token: 'csrf-e2e' } }));
   await page.route('**/api/Authentication/get_session', (route) => route.fulfill({ json: { email: EMAIL } }));
};

const mockList = async (page: Page, items: ReturnType<typeof item>[]): Promise<void> => {
   await page.route('**/api/Campaign/get_all_with_pagination_campaign**', (route) => {
      const status = new URL(route.request().url()).searchParams.get('status');
      const filtered = status ? items.filter((entry) => entry.status === status) : items;
      return route.fulfill({ json: pageOf(filtered) });
   });
};

test.describe('Lista de campanhas (API mockada)', () => {
   test('lista vazia mostra a ação Criar a primeira campanha', async ({ page }) => {
      await mockSession(page);
      await mockList(page, []);

      await page.goto('/campaigns');
      await expect(page.getByTestId('campaigns-empty')).toBeVisible();
      await page.getByTestId('campaigns-create-first').click();

      await expect(page).toHaveURL('/campaigns/new');
   });

   test('lista campanhas em estados diferentes, filtra e abre o detalhe com o histórico', async ({ page }) => {
      await mockSession(page);
      await mockList(page, [item(ID_A, 'Campanha A', 'Running'), item(ID_B, 'Campanha B', 'Draft')]);
      await page.route('**/api/Campaign/get_by_id_campaign**', (route) =>
         route.fulfill({
            json: {
               id: ID_A,
               name: 'Campanha A',
               objective: 'Objetivo',
               idealProfile: null,
               segment: 'Tecnologia',
               services: null,
               differentials: null,
               valueProposition: null,
               targetLeadCount: 10,
               locations: [{ state: 'SP', municipalityCode: '7107', municipalityName: 'SAO PAULO' }],
               cnaes: [{ code: '6201501', description: 'Software' }],
               status: 'Running',
               createdAt: '2026-11-02T10:00:00Z',
               updatedAt: '2026-11-02T10:00:00Z',
               progress: null,
            },
         }),
      );
      await page.route('**/api/Campaign/get_history_campaign**', (route) =>
         route.fulfill({
            json: pageOf([
               { type: 'CampaignStarted', description: 'Campanha iniciada.', occurredAt: '2026-11-02T10:30:00Z' },
               { type: 'CampaignCreated', description: 'Campanha criada.', occurredAt: '2026-11-02T10:00:00Z' },
            ]),
         }),
      );

      await page.goto('/campaigns');
      await expect(page.getByTestId(`campaigns-row-${ID_A}`)).toContainText('Em execução');
      await expect(page.getByTestId(`campaigns-row-${ID_B}`)).toContainText('Rascunho');

      await page.getByTestId('campaigns-status').selectOption('Draft');
      await expect(page.getByTestId(`campaigns-row-${ID_B}`)).toBeVisible();
      await expect(page.getByTestId(`campaigns-row-${ID_A}`)).toHaveCount(0);

      await page.getByTestId('campaigns-status').selectOption('');
      await page.getByTestId(`campaigns-row-${ID_A}`).click();

      await expect(page).toHaveURL(`/campaigns/${ID_A}`);
      await expect(page.getByTestId('campaign-detail-name')).toHaveText('Campanha A');
      await expect(page.getByTestId('campaign-history-list')).toContainText('Campanha iniciada');
      await expect(page.getByTestId('campaign-history-list')).toContainText('Campanha criada');
   });

   test('Home tem o link Campanhas que leva à lista', async ({ page }) => {
      await mockSession(page);
      await mockList(page, []);

      await page.goto('/home');
      await page.getByTestId('home-campaigns').click();

      await expect(page).toHaveURL('/campaigns');
   });
});
