import type {
   TCampaignHistoryRequest,
   TCampaignListRequest,
   TCreateCampaignRequest,
   TUpdateCampaignRequest,
} from '@request/campaign.request';
import type { TCampaignDetailResponse } from '@response/campaignDetail.response';
import type { TCampaignEventListResponse } from '@response/campaignEvent.response';
import type { TCampaignListResponse } from '@response/campaignList.response';

type TCallOptions = { signal?: AbortSignal };

export interface ICampaignService {
   createCampaign(request: TCreateCampaignRequest, options?: TCallOptions): Promise<boolean>;
   updateCampaign(request: TUpdateCampaignRequest, options?: TCallOptions): Promise<boolean>;
   startCampaign(id: string, options?: TCallOptions): Promise<boolean>;
   pauseCampaign(id: string, options?: TCallOptions): Promise<boolean>;
   resumeCampaign(id: string, options?: TCallOptions): Promise<boolean>;
   cancelCampaign(id: string, options?: TCallOptions): Promise<boolean>;
   /** Devolve null quando a campanha não existe ou é de outra unidade (a API responde 200 com corpo null). */
   getCampaignById(id: string, options?: TCallOptions): Promise<TCampaignDetailResponse | null>;
   getAllCampaigns(request: TCampaignListRequest, options?: TCallOptions): Promise<TCampaignListResponse>;
   getCampaignHistory(request: TCampaignHistoryRequest, options?: TCallOptions): Promise<TCampaignEventListResponse>;
}
