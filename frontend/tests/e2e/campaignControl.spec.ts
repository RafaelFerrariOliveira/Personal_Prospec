import { expect, test, type Page, type Route } from '@playwright/test';

const EMAIL = 'usuario@exemplo.com';
const ID = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';

type TStatus = 'Draft' | 'Running' | 'Paused' | 'Completed' | 'Cancelled';

// API mockada com estado mínimo: a campanha muda de estado como o backend faria e o histórico acumula eventos.
const mockApi = async (page: Page): Promise<{ updateBodies: unknown[] }> => {
   let status: TStatus = 'Draft';
   const events: { type: string; description: string; occurredAt: string }[] = [
      { type: 'CampaignCreated', description: 'Campanha criada.', occurredAt: '2026-11-02T10:00:00Z' },
   ];
   const updateBodies: unknown[] = [];

   const detail = () => ({
      id: ID,
      name: 'Campanha de software',
      objective: 'Prospectar empresas de tecnologia',
      idealProfile: null,
      segment: 'Tecnologia',
      services: null,
      differentials: null,
      valueProposition: null,
      targetLeadCount: 50,
      locations: [{ state: 'SP', municipalityCode: '6291', municipalityName: 'CAMPINAS' }],
      cnaes: [{ code: '6201501', description: 'Software sob encomenda' }],
      status,
      createdAt: '2026-11-02T10:00:00Z',
      updatedAt: `2026-11-02T10:0${events.length}:00Z`,
      progress: null,
   });

   const transition = (route: Route, allowed: TStatus[], to: TStatus, type: string) => {
      if (!allowed.includes(status)) {
         return route.fulfill({ status: 400, json: [{ key: 'Campaign', value: `A campanha está ${status}.` }] });
      }
      status = to;
      events.unshift({ type, description: type, occurredAt: `2026-11-02T10:0${events.length}:00Z` });
      return route.fulfill({ json: true });
   };

   await page.route('**/api/Antiforgery/token', (route) => route.fulfill({ json: { token: 'csrf-e2e' } }));
   await page.route('**/api/Authentication/get_session', (route) => route.fulfill({ json: { email: EMAIL } }));
   await page.route('**/api/Campaign/get_by_id_campaign**', (route) => route.fulfill({ json: detail() }));
   // O formulário de edição carrega as listas de referência: sem mock, a chamada vazaria para a Api real.
   await page.route('**/api/Reference/get_states_reference', (route) =>
      route.fulfill({ json: [{ code: 'SP', name: 'SAO PAULO' }] }),
   );
   await page.route('**/api/Reference/get_municipalities_reference**', (route) =>
      route.fulfill({
         json: {
            items: [{ code: '6291', name: 'CAMPINAS' }],
            totalCount: 1,
            pageNumber: 1,
            pageSize: 30,
            totalPages: 1,
         },
      }),
   );
   await page.route('**/api/Campaign/get_history_campaign**', (route) =>
      route.fulfill({
         json: { items: events, totalCount: events.length, pageNumber: 1, pageSize: 20, totalPages: 1 },
      }),
   );
   await page.route('**/api/Campaign/start_campaign', (route) =>
      transition(route, ['Draft'], 'Running', 'CampaignStarted'),
   );
   await page.route('**/api/Campaign/pause_campaign', (route) =>
      transition(route, ['Running'], 'Paused', 'CampaignPaused'),
   );
   await page.route('**/api/Campaign/resume_campaign', (route) =>
      transition(route, ['Paused'], 'Running', 'CampaignResumed'),
   );
   await page.route('**/api/Campaign/cancel_campaign', (route) =>
      transition(route, ['Draft', 'Running', 'Paused'], 'Cancelled', 'CampaignCancelled'),
   );
   await page.route('**/api/Campaign/update_campaign', (route) => {
      updateBodies.push(route.request().postDataJSON());
      events.unshift({
         type: 'CampaignUpdated',
         description: 'Campo alterado: name',
         occurredAt: '2026-11-02T10:09:00Z',
      });
      return route.fulfill({ json: true });
   });

   return { updateBodies };
};

test.describe('Controlar campanha (API mockada)', () => {
   test('iniciar mostra o Agente de IA iniciado e depois o detalhe; pausar, editar, retomar e cancelar', async ({
      page,
   }) => {
      const { updateBodies } = await mockApi(page);
      await page.goto(`/campaigns/${ID}`);

      await expect(page.getByTestId('status-badge')).toHaveText('Rascunho');
      await expect(page.getByTestId('campaign-detail-progress')).toHaveText('A pesquisa ainda não foi executada');

      await page.getByTestId('campaign-action-start').click();
      await expect(page.getByText('Agente de IA iniciado')).toBeVisible();
      await expect(page).toHaveURL(`/campaigns/${ID}`, { timeout: 10_000 });
      await expect(page.getByTestId('status-badge')).toHaveText('Em execução');

      await expect(page.getByTestId('campaign-action-edit')).toBeDisabled();
      await expect(page.getByTestId('campaign-action-edit-hint')).toContainText('Pause a campanha antes de editar');

      await page.getByTestId('campaign-action-pause').click();
      await expect(page.getByTestId('status-badge')).toHaveText('Pausada');
      await expect(page.getByTestId('campaign-history-list')).toContainText('Campanha pausada');

      await page.getByTestId('campaign-action-edit').click();
      await expect(page).toHaveURL(`/campaigns/${ID}/edit`);
      await expect(page.getByTestId('campaign-name')).toHaveValue('Campanha de software');
      await page.getByTestId('campaign-name').fill('Campanha de software editada');
      for (let step = 0; step < 5; step += 1) {
         await page.getByTestId('campaign-next').click();
      }
      await page.getByTestId('campaign-save').click();
      await expect(page).toHaveURL(`/campaigns/${ID}`);
      expect(updateBodies).toHaveLength(1);
      expect(updateBodies[0]).toMatchObject({ id: ID, name: 'Campanha de software editada' });

      await page.getByTestId('campaign-action-resume').click();
      await expect(page.getByTestId('status-badge')).toHaveText('Em execução');

      await page.getByTestId('campaign-action-cancel').click();
      await expect(page.getByTestId('campaign-cancel-confirm')).toBeVisible();
      await page.getByTestId('campaign-cancel-confirm-yes').click();
      await expect(page.getByTestId('status-badge')).toHaveText('Cancelada');
      await expect(page.getByTestId('campaign-action-cancel')).toHaveCount(0);
   });

   test('voltar na confirmação não cancela a campanha', async ({ page }) => {
      await mockApi(page);
      await page.goto(`/campaigns/${ID}`);

      await page.getByTestId('campaign-action-cancel').click();
      await page.getByTestId('campaign-cancel-confirm-no').click();

      await expect(page.getByTestId('campaign-cancel-confirm')).toHaveCount(0);
      await expect(page.getByTestId('status-badge')).toHaveText('Rascunho');
   });

   test('campanha inexistente mostra Campanha não encontrada', async ({ page }) => {
      await mockApi(page);
      await page.route('**/api/Campaign/get_by_id_campaign**', (route) => route.fulfill({ json: null }));

      await page.goto(`/campaigns/${ID}`);

      await expect(page.getByTestId('campaign-detail-not-found')).toContainText('Campanha não encontrada');
   });
});
