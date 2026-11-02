import { injectable } from 'inversify';
import { ApiControllers } from '@api/api.controllers';
import { createEmptyPaginatedResponse } from '@application/validation/apiResponseSchemas';
import type { IReferenceService } from '@interfaces/reference.interface';
import type { TMunicipalitiesQuery } from '@request/reference.request';
import {
   ZCnaeListResponseSchema,
   ZMunicipalityPageResponseSchema,
   ZStateListResponseSchema,
   type TCnaeResponse,
   type TMunicipalityPageResponse,
   type TMunicipalityResponse,
   type TStateResponse,
} from '@response/reference.response';
import { BaseService } from './Base.service';

type TCallOptions = { signal?: AbortSignal };

const signalConfig = (options?: TCallOptions): { signal?: AbortSignal } =>
   options?.signal ? { signal: options.signal } : {};

@injectable()
export class ReferenceService extends BaseService implements IReferenceService {
   public getStates = async (options?: TCallOptions): Promise<TStateResponse[]> => {
      return this.execute(
         'getStates',
         async () => {
            const response = await this.http.get(
               this.buildPath(ApiControllers.Reference, 'get_states_reference'),
               signalConfig(options),
            );
            return this.validateResponse(ZStateListResponseSchema, response.data, [], 'ReferenceService.getStates');
         },
         { rethrow: true },
      );
   };

   public getMunicipalities = async (
      query: TMunicipalitiesQuery,
      options?: TCallOptions,
   ): Promise<TMunicipalityPageResponse> => {
      return this.execute(
         'getMunicipalities',
         async () => {
            const { search, ...rest } = query;
            const params = search ? { ...rest, search } : rest;
            const response = await this.http.get(
               this.buildPath(ApiControllers.Reference, 'get_municipalities_reference'),
               { params, ...signalConfig(options) },
            );
            return this.validateResponse(
               ZMunicipalityPageResponseSchema,
               response.data,
               createEmptyPaginatedResponse<TMunicipalityResponse>(),
               'ReferenceService.getMunicipalities',
            );
         },
         { rethrow: true },
      );
   };

   public searchCnae = async (search: string, options?: TCallOptions): Promise<TCnaeResponse[]> => {
      return this.execute(
         'searchCnae',
         async () => {
            const response = await this.http.get(this.buildPath(ApiControllers.Reference, 'search_cnae_reference'), {
               params: { search },
               ...signalConfig(options),
            });
            return this.validateResponse(ZCnaeListResponseSchema, response.data, [], 'ReferenceService.searchCnae');
         },
         { rethrow: true },
      );
   };
}
