import { AxiosError, type AxiosResponse } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { http } from '@axios/axios.instance';
import { CampaignService } from '@application/service/campaign.service';
import type { TCreateCampaignRequest } from '@request/campaign.request';

const response = (data: unknown): AxiosResponse => ({
   data,
   status: 200,
   statusText: '',
   headers: {},
   config: {} as AxiosResponse['config'],
});

const request: TCreateCampaignRequest = {
   requestId: '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b',
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

describe('CampaignService.createCampaign', () => {
   afterEach(() => {
      vi.restoreAllMocks();
   });

   it('envia o request para Campaign/create_campaign e devolve true', async () => {
      // Arrange
      const post = vi.spyOn(http, 'post').mockResolvedValue(response(true));

      // Act
      const result = await new CampaignService().createCampaign(request);

      // Assert
      expect(result).toBe(true);
      expect(post).toHaveBeenCalledWith('Campaign/create_campaign', request, {});
   });

   it('devolve false quando o corpo não passa no Zod', async () => {
      // Arrange
      vi.spyOn(http, 'post').mockResolvedValue(response({ ok: 1 }));

      // Act
      const result = await new CampaignService().createCampaign(request);

      // Assert
      expect(result).toBe(false);
   });

   it('rejeita quando a API falha', async () => {
      // Arrange
      vi.spyOn(http, 'post').mockRejectedValue(new AxiosError('falha'));

      // Act
      const result = new CampaignService().createCampaign(request);

      // Assert
      await expect(result).rejects.toBeInstanceOf(AxiosError);
   });

   it('repassa o signal', async () => {
      // Arrange
      const post = vi.spyOn(http, 'post').mockResolvedValue(response(true));
      const { signal } = new AbortController();

      // Act
      await new CampaignService().createCampaign(request, { signal });

      // Assert
      expect(post.mock.calls[0]?.[2]).toEqual({ signal });
   });
});
