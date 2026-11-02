import type { TMunicipalitiesQuery } from '@request/reference.request';
import type { TCnaeResponse, TMunicipalityPageResponse, TStateResponse } from '@response/reference.response';

export interface IReferenceService {
   getStates(options?: { signal?: AbortSignal }): Promise<TStateResponse[]>;
   getMunicipalities(
      query: TMunicipalitiesQuery,
      options?: { signal?: AbortSignal },
   ): Promise<TMunicipalityPageResponse>;
   searchCnae(search: string, options?: { signal?: AbortSignal }): Promise<TCnaeResponse[]>;
}
