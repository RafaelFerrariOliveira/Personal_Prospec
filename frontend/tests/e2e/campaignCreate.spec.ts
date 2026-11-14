import { expect, test, type Page } from '@playwright/test';

const EMAIL = 'usuario@exemplo.com';

type TCapture = { createBody: Record<string, unknown> | null; createCalls: number };

// API mockada: sessão ativa e dados de referência mínimos; captura o corpo enviado em create_campaign.
const mockApi = async (page: Page): Promise<TCapture> => {
   const capture: TCapture = { createBody: null, createCalls: 0 };

   await page.route('**/api/Antiforgery/token', (route) => route.fulfill({ json: { token: 'csrf-e2e' } }));
   await page.route('**/api/Authentication/get_session', (route) => route.fulfill({ json: { email: EMAIL } }));
   await page.route('**/api/Reference/get_states_reference', (route) =>
      route.fulfill({
         json: [
            { code: 'SP', name: 'SAO PAULO' },
            { code: 'RJ', name: 'RIO DE JANEIRO' },
         ],
      }),
   );
   await page.route('**/api/Reference/get_municipalities_reference**', (route) =>
      route.fulfill({
         json: {
            items: [
               { code: '7107', name: 'SAO PAULO' },
               { code: '6291', name: 'CAMPINAS' },
            ],
            totalCount: 2,
            pageNumber: 1,
            pageSize: 30,
            totalPages: 1,
         },
      }),
   );
   await page.route('**/api/Reference/search_cnae_reference**', (route) =>
      route.fulfill({
         json: [{ code: '6201501', description: 'Desenvolvimento de programas de computador sob encomenda' }],
      }),
   );
   await page.route('**/api/Campaign/create_campaign', (route) => {
      capture.createCalls += 1;
      capture.createBody = route.request().postDataJSON() as Record<string, unknown>;
      return route.fulfill({ json: true });
   });
   // A lista devolve a campanha salva depois do create_campaign.
   await page.route('**/api/Campaign/get_all_with_pagination_campaign**', (route) =>
      route.fulfill({
         json: {
            items:
               capture.createCalls > 0
                  ? [
                       {
                          id: '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b',
                          name: 'Campanha de software',
                          segment: 'Tecnologia',
                          locationSummary: 'SP, 1 cidade',
                          status: 'Draft',
                          createdAt: '2026-11-02T10:00:00Z',
                       },
                    ]
                  : [],
            totalCount: capture.createCalls > 0 ? 1 : 0,
            pageNumber: 1,
            pageSize: 20,
            totalPages: 1,
         },
      }),
   );

   return capture;
};

const advance = async (page: Page): Promise<void> => {
   await page.getByTestId('campaign-next').click();
};

test.describe('Criar campanha (API mockada)', () => {
   test('preenche as etapas, confere o resumo e salva', async ({ page }) => {
      const capture = await mockApi(page);
      await page.goto('/campaigns/new');

      await page.getByTestId('campaign-name').fill('Campanha de software');
      await page.getByTestId('campaign-objective').fill('Prospectar empresas de tecnologia');
      await advance(page);

      await page.getByTestId('municipality-state').selectOption('SP');
      await page.getByTestId('municipality-city-6291').click();
      await advance(page);

      await page.getByTestId('campaign-segment').fill('Tecnologia');
      await page.getByTestId('cnae-search-input').fill('6201');
      await page.getByTestId('cnae-search-result-6201501').click();
      await advance(page);

      await advance(page);

      await page.getByTestId('campaign-target-lead-count').fill('50');
      await advance(page);

      const summary = page.getByTestId('campaign-summary');
      await expect(summary).toContainText('Campanha de software');
      await expect(summary).toContainText('SP: Campinas');
      await expect(summary).toContainText('6201501');
      await expect(summary).toContainText('50');

      await page.getByTestId('campaign-save').click();

      await expect(page).toHaveURL('/campaigns');
      await expect(page.getByTestId('campaigns-created-notice')).toHaveText('Campanha salva.');
      await expect(page.getByTestId('campaigns-list')).toContainText('Campanha de software');
      await expect(page.getByTestId('campaigns-list')).toContainText('Rascunho');
      expect(capture.createCalls).toBe(1);
      expect(capture.createBody).toMatchObject({
         name: 'Campanha de software',
         segment: 'Tecnologia',
         targetLeadCount: 50,
         locations: [{ state: 'SP', municipalityCode: '6291' }],
         cnaeCodes: ['6201501'],
      });
      expect(typeof capture.createBody?.['requestId']).toBe('string');
   });

   test('campo obrigatório faltando é indicado e não avança', async ({ page }) => {
      await mockApi(page);
      await page.goto('/campaigns/new');

      await advance(page);

      await expect(page.getByTestId('campaign-name-error')).toHaveText('Informe o nome da campanha.');
      await expect(page.getByTestId('campaign-objective-error')).toBeVisible();
      await expect(page.getByTestId('municipality-picker')).toHaveCount(0);
   });

   test('voltar de etapa mantém o que foi digitado', async ({ page }) => {
      await mockApi(page);
      await page.goto('/campaigns/new');
      await page.getByTestId('campaign-name').fill('Nome mantido');
      await page.getByTestId('campaign-objective').fill('Objetivo mantido');
      await advance(page);

      await page.getByTestId('campaign-back').click();

      await expect(page.getByTestId('campaign-name')).toHaveValue('Nome mantido');
   });
});
