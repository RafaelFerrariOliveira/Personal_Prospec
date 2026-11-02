import { useCallback, useEffect, useState } from 'react';
import type { ICampaignService } from '@interfaces/campaign.interface';
import type { TCampaignDetailResponse } from '@response/campaignDetail.response';
import { toApiErrorMessages } from '@utils/apiErrorMessages';

const GENERIC_ERROR_MESSAGE = 'Não foi possível carregar a campanha. Tente novamente em instantes.';

export interface IUseCampaignDetailResult {
   detail: TCampaignDetailResponse | null;
   isLoading: boolean;
   /** A API responde 200 com null para campanha inexistente ou de outra unidade. */
   isNotFound: boolean;
   errorMessages: string[];
   reload: () => void;
}

/** Carrega o detalhe da campanha com cancelamento por AbortSignal; nunca deixa a tela carregando para sempre. */
export const useCampaignDetail = (
   campaignService: ICampaignService,
   id: string | undefined,
): IUseCampaignDetailResult => {
   const [detail, setDetail] = useState<TCampaignDetailResponse | null>(null);
   const [isLoading, setIsLoading] = useState(Boolean(id));
   const [isNotFound, setIsNotFound] = useState(false);
   const [errorMessages, setErrorMessages] = useState<string[]>([]);
   const [reloadToken, setReloadToken] = useState(0);

   useEffect(() => {
      if (!id) {
         setIsLoading(false);
         setIsNotFound(true);
         return undefined;
      }
      const controller = new AbortController();
      setIsLoading(true);
      setErrorMessages([]);
      const load = async (): Promise<void> => {
         try {
            const found = await campaignService.getCampaignById(id, { signal: controller.signal });
            // Resposta que chega depois de sair da página (ou de trocar de id) é descartada.
            if (controller.signal.aborted) return;
            setDetail(found);
            setIsNotFound(found === null);
         } catch (error: unknown) {
            if (controller.signal.aborted) return;
            setErrorMessages(toApiErrorMessages(error, GENERIC_ERROR_MESSAGE));
         } finally {
            if (!controller.signal.aborted) setIsLoading(false);
         }
      };
      void load();
      return () => controller.abort();
   }, [campaignService, id, reloadToken]);

   const reload = useCallback((): void => setReloadToken((token) => token + 1), []);

   return { detail, isLoading, isNotFound, errorMessages, reload };
};
