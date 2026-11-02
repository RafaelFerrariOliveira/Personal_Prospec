import { injectable } from 'inversify';
import { ApiControllers } from '@api/api.controllers';
import { createEmptyPaginatedResponse, ZApiBooleanResponse } from '@application/validation/apiResponseSchemas';
import type { ICampaignService } from '@interfaces/campaign.interface';
import type {
   TCampaignHistoryRequest,
   TCampaignListRequest,
   TCreateCampaignRequest,
   TUpdateCampaignRequest,
} from '@request/campaign.request';
import type { TCampaignIdRequest } from '@request/campaignId.request';
import { ZCampaignDetailResponseSchema, type TCampaignDetailResponse } from '@response/campaignDetail.response';
import {
   ZCampaignEventListResponseSchema,
   type TCampaignEvent,
   type TCampaignEventListResponse,
} from '@response/campaignEvent.response';
import {
   ZCampaignListResponseSchema,
   type TCampaignListItem,
   type TCampaignListResponse,
} from '@response/campaignList.response';
import { BaseService } from './Base.service';

type TCallOptions = { signal?: AbortSignal };

const signalConfig = (options?: TCallOptions): { signal?: AbortSignal } =>
   options?.signal ? { signal: options.signal } : {};

const ZNullableDetailSchema = ZCampaignDetailResponseSchema.nullable();

@injectable()
export class CampaignService extends BaseService implements ICampaignService {
   public createCampaign = async (request: TCreateCampaignRequest, options?: TCallOptions): Promise<boolean> => {
      return this.execute(
         'createCampaign',
         async () => {
            const response = await this.http.post(
               this.buildPath(ApiControllers.Campaign, 'create_campaign'),
               request,
               signalConfig(options),
            );
            return this.validateResponse(ZApiBooleanResponse, response.data, false, 'CampaignService.createCampaign');
         },
         { rethrow: true },
      );
   };

   public updateCampaign = async (request: TUpdateCampaignRequest, options?: TCallOptions): Promise<boolean> => {
      return this.execute(
         'updateCampaign',
         async () => {
            const response = await this.http.put(
               this.buildPath(ApiControllers.Campaign, 'update_campaign'),
               request,
               signalConfig(options),
            );
            return this.validateResponse(ZApiBooleanResponse, response.data, false, 'CampaignService.updateCampaign');
         },
         { rethrow: true },
      );
   };

   public startCampaign = (id: string, options?: TCallOptions): Promise<boolean> =>
      this.changeState('start_campaign', id, options);

   public pauseCampaign = (id: string, options?: TCallOptions): Promise<boolean> =>
      this.changeState('pause_campaign', id, options);

   public resumeCampaign = (id: string, options?: TCallOptions): Promise<boolean> =>
      this.changeState('resume_campaign', id, options);

   public cancelCampaign = (id: string, options?: TCallOptions): Promise<boolean> =>
      this.changeState('cancel_campaign', id, options);

   public getCampaignById = async (id: string, options?: TCallOptions): Promise<TCampaignDetailResponse | null> => {
      return this.execute(
         'getCampaignById',
         async () => {
            const response = await this.http.get(this.buildPath(ApiControllers.Campaign, 'get_by_id_campaign'), {
               params: { id },
               ...signalConfig(options),
            });
            return this.validateResponse(ZNullableDetailSchema, response.data, null, 'CampaignService.getCampaignById');
         },
         { rethrow: true },
      );
   };

   public getAllCampaigns = async (
      request: TCampaignListRequest,
      options?: TCallOptions,
   ): Promise<TCampaignListResponse> => {
      return this.execute(
         'getAllCampaigns',
         async () => {
            const response = await this.http.get(
               this.buildPath(ApiControllers.Campaign, 'get_all_with_pagination_campaign'),
               { params: request, ...signalConfig(options) },
            );
            return this.validateResponse(
               ZCampaignListResponseSchema,
               response.data,
               createEmptyPaginatedResponse<TCampaignListItem>(),
               'CampaignService.getAllCampaigns',
            );
         },
         { rethrow: true },
      );
   };

   public getCampaignHistory = async (
      request: TCampaignHistoryRequest,
      options?: TCallOptions,
   ): Promise<TCampaignEventListResponse> => {
      return this.execute(
         'getCampaignHistory',
         async () => {
            const response = await this.http.get(this.buildPath(ApiControllers.Campaign, 'get_history_campaign'), {
               params: request,
               ...signalConfig(options),
            });
            return this.validateResponse(
               ZCampaignEventListResponseSchema,
               response.data,
               createEmptyPaginatedResponse<TCampaignEvent>(),
               'CampaignService.getCampaignHistory',
            );
         },
         { rethrow: true },
      );
   };

   private changeState = async (action: string, id: string, options?: TCallOptions): Promise<boolean> => {
      const body: TCampaignIdRequest = { id };
      return this.execute(
         action,
         async () => {
            const response = await this.http.post(
               this.buildPath(ApiControllers.Campaign, action),
               body,
               signalConfig(options),
            );
            return this.validateResponse(ZApiBooleanResponse, response.data, false, `CampaignService.${action}`);
         },
         { rethrow: true },
      );
   };
}
