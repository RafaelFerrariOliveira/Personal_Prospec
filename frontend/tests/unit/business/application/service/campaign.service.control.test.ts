import { AxiosError, type AxiosResponse } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { http } from '@axios/axios.instance';
import { CampaignService } from '@application/service/campaign.service';
import { ECampaignStatus } from '@enums/campaignStatus.enum';
import type { TUpdateCampaignRequest } from '@request/campaign.request';

const CAMPAIGN_ID = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';

const response = (data: unknown): AxiosResponse => ({
   data,
   status: 200,
   statusText: '',
   headers: {},
   config: {} as AxiosResponse['config'],
});

const updateRequest: TUpdateCampaignRequest = {
   id: CAMPAIGN_ID,
   name: 'Campanha',
   objective: 'Objetivo',
   idealProfile: '',
   segment: 'Segmento',
   services: '',
   differentials: '',
   valueProposition: '',
   targetLeadCount: 10,
   locations: [{ state: 'SP', municipalityCode: '7107' }],
   cnaeCodes: ['6201501'],
};

const detailBody = {
   id: CAMPAIGN_ID,
   name: 'Campanha',
   objective: 'Objetivo',
   idealProfile: null,
   segment: 'Segmento',
   services: null,
   differentials: null,
   valueProposition: null,
   targetLeadCount: 10,
   locations: [{ state: 'SP', municipalityCode: '7107', municipalityName: 'SAO PAULO' }],
   cnaes: [{ code: '6201501', description: 'Software' }],
   status: 'Draft',
   createdAt: '2026-11-02T10:00:00Z',
   updatedAt: '2026-11-02T10:00:00Z',
   progress: null,
};

const pageOf = (items: unknown[]) => ({ items, totalCount: items.length, pageNumber: 1, pageSize: 20, totalPages: 1 });

describe('CampaignService: edição e controle de estado', () => {
   afterEach(() => {
      vi.restoreAllMocks();
   });

   it('updateCampaign envia PUT com o id e devolve true', async () => {
      // Arrange
      const put = vi.spyOn(http, 'put').mockResolvedValue(response(true));

      // Act
      const result = await new CampaignService().updateCampaign(updateRequest);

      // Assert
      expect(result).toBe(true);
      expect(put).toHaveBeenCalledWith('Campaign/update_campaign', updateRequest, {});
   });

   it('updateCampaign rejeita em erro e repassa o signal', async () => {
      // Arrange
      const { signal } = new AbortController();
      const put = vi.spyOn(http, 'put').mockRejectedValue(new AxiosError('falha'));

      // Act
      const result = new CampaignService().updateCampaign(updateRequest, { signal });

      // Assert
      await expect(result).rejects.toBeInstanceOf(AxiosError);
      expect(put.mock.calls[0]?.[2]).toEqual({ signal });
   });

   it.each([
      ['startCampaign', 'Campaign/start_campaign'],
      ['pauseCampaign', 'Campaign/pause_campaign'],
      ['resumeCampaign', 'Campaign/resume_campaign'],
      ['cancelCampaign', 'Campaign/cancel_campaign'],
   ] as const)('%s envia POST com id e devolve true', async (method, path) => {
      // Arrange
      const post = vi.spyOn(http, 'post').mockResolvedValue(response(true));
      const { signal } = new AbortController();

      // Act
      const result = await new CampaignService()[method](CAMPAIGN_ID, { signal });

      // Assert
      expect(result).toBe(true);
      expect(post).toHaveBeenCalledWith(path, { id: CAMPAIGN_ID }, { signal });
   });

   it.each(['startCampaign', 'pauseCampaign', 'resumeCampaign', 'cancelCampaign'] as const)(
      '%s rejeita quando a API recusa e devolve false com corpo inválido',
      async (method) => {
         // Arrange
         const post = vi.spyOn(http, 'post').mockRejectedValueOnce(new AxiosError('falha'));

         // Act
         const failed = new CampaignService()[method](CAMPAIGN_ID);
         post.mockResolvedValueOnce(response('x'));
         const invalid = await new CampaignService()[method](CAMPAIGN_ID);

         // Assert
         await expect(failed).rejects.toBeInstanceOf(AxiosError);
         expect(invalid).toBe(false);
      },
   );
});

describe('CampaignService: consultas', () => {
   afterEach(() => {
      vi.restoreAllMocks();
   });

   it('getCampaignById devolve o detalhe validado', async () => {
      // Arrange
      const get = vi.spyOn(http, 'get').mockResolvedValue(response(detailBody));
      const { signal } = new AbortController();

      // Act
      const result = await new CampaignService().getCampaignById(CAMPAIGN_ID, { signal });

      // Assert
      expect(result?.name).toBe('Campanha');
      expect(get).toHaveBeenCalledWith('Campaign/get_by_id_campaign', { params: { id: CAMPAIGN_ID }, signal });
   });

   it('getCampaignById devolve null quando a API responde null (inexistente ou de outra unidade)', async () => {
      // Arrange
      vi.spyOn(http, 'get').mockResolvedValue(response(null));

      // Act
      const result = await new CampaignService().getCampaignById(CAMPAIGN_ID);

      // Assert
      expect(result).toBeNull();
   });

   it('getCampaignById devolve null com corpo inválido e rejeita em erro', async () => {
      // Arrange
      const get = vi.spyOn(http, 'get').mockResolvedValueOnce(response({ id: 1 }));

      // Act
      const invalid = await new CampaignService().getCampaignById(CAMPAIGN_ID);
      get.mockRejectedValueOnce(new AxiosError('falha'));
      const failed = new CampaignService().getCampaignById(CAMPAIGN_ID);

      // Assert
      expect(invalid).toBeNull();
      await expect(failed).rejects.toBeInstanceOf(AxiosError);
   });

   it('getAllCampaigns envia a query e devolve a página validada', async () => {
      // Arrange
      const item = {
         id: CAMPAIGN_ID,
         name: 'Campanha',
         segment: 'Seg',
         locationSummary: 'SP, 1 cidade',
         status: 'Running',
         createdAt: '2026-11-02T10:00:00Z',
      };
      const get = vi.spyOn(http, 'get').mockResolvedValue(response(pageOf([item])));
      const query = { status: ECampaignStatus.Running, pageNumber: 1, pageSize: 20 };

      // Act
      const result = await new CampaignService().getAllCampaigns(query);

      // Assert
      expect(result.items[0]?.status).toBe('Running');
      expect(get).toHaveBeenCalledWith('Campaign/get_all_with_pagination_campaign', { params: query });
   });

   it('getAllCampaigns devolve página vazia com status desconhecido e rejeita em erro', async () => {
      // Arrange
      const get = vi.spyOn(http, 'get').mockResolvedValueOnce(response(pageOf([{ id: CAMPAIGN_ID, status: 'Outro' }])));

      // Act
      const invalid = await new CampaignService().getAllCampaigns({ pageNumber: 1, pageSize: 20 });
      get.mockRejectedValueOnce(new AxiosError('falha'));
      const failed = new CampaignService().getAllCampaigns({ pageNumber: 1, pageSize: 20 });

      // Assert
      expect(invalid.items).toEqual([]);
      await expect(failed).rejects.toBeInstanceOf(AxiosError);
   });

   it('getCampaignHistory envia a query com o id e devolve os eventos', async () => {
      // Arrange
      const event = { type: 'CampaignCreated', description: 'Campanha criada.', occurredAt: '2026-11-02T10:00:00Z' };
      const get = vi.spyOn(http, 'get').mockResolvedValue(response(pageOf([event])));
      const query = { id: CAMPAIGN_ID, pageNumber: 1, pageSize: 20 };
      const { signal } = new AbortController();

      // Act
      const result = await new CampaignService().getCampaignHistory(query, { signal });

      // Assert
      expect(result.items).toHaveLength(1);
      expect(get).toHaveBeenCalledWith('Campaign/get_history_campaign', { params: query, signal });
   });

   it('getCampaignHistory devolve página vazia com corpo inválido e rejeita em erro', async () => {
      // Arrange
      const get = vi.spyOn(http, 'get').mockResolvedValueOnce(response({ items: 'x' }));
      const query = { id: CAMPAIGN_ID, pageNumber: 1, pageSize: 20 };

      // Act
      const invalid = await new CampaignService().getCampaignHistory(query);
      get.mockRejectedValueOnce(new AxiosError('falha'));
      const failed = new CampaignService().getCampaignHistory(query);

      // Assert
      expect(invalid.items).toEqual([]);
      await expect(failed).rejects.toBeInstanceOf(AxiosError);
   });
});
