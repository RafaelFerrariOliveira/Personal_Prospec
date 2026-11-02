import { useCallback, useRef, useState } from 'react';
import { CAMPAIGN_EDIT_BLOCKED_MESSAGE, CampaignStateMachine } from '@domain/campaignStateMachine';
import { ECampaignStatus } from '@enums/campaignStatus.enum';
import { buildCampaignEditPath, buildCampaignStartedPath } from '@routes/routePaths';
import { toApiErrorMessages } from '@utils/apiErrorMessages';
import type { ICampaignActionsController, ICampaignActionsControllerDeps } from './campaignActions.types';

const GENERIC_ERROR_MESSAGE = 'Não foi possível concluir a ação. Tente novamente em instantes.';

const UseCampaignActionsController = ({
   campaignId,
   status,
   onChanged,
   campaignService,
   navigate,
}: ICampaignActionsControllerDeps): ICampaignActionsController => {
   const [isBusy, setIsBusy] = useState(false);
   const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
   const [errorMessages, setErrorMessages] = useState<string[]>([]);
   const isRunningAction = useRef(false);

   const run = useCallback(async (action: () => Promise<boolean>, onSuccess: () => void): Promise<void> => {
      // Trava duplo clique antes de o estado refletir isBusy.
      if (isRunningAction.current) return;
      isRunningAction.current = true;
      setIsBusy(true);
      setErrorMessages([]);
      try {
         const isDone = await action();
         if (!isDone) throw new Error('Resposta inesperada da API.');
         onSuccess();
      } catch (error: unknown) {
         setErrorMessages(toApiErrorMessages(error, GENERIC_ERROR_MESSAGE));
      } finally {
         isRunningAction.current = false;
         setIsBusy(false);
      }
   }, []);

   const onStart = useCallback((): void => {
      if (!CampaignStateMachine.canStart(status)) return;
      void run(
         () => campaignService.startCampaign(campaignId),
         () => navigate(buildCampaignStartedPath(campaignId)),
      );
   }, [status, run, campaignService, campaignId, navigate]);

   const onPause = useCallback((): void => {
      if (!CampaignStateMachine.canPause(status)) return;
      void run(() => campaignService.pauseCampaign(campaignId), onChanged);
   }, [status, run, campaignService, campaignId, onChanged]);

   const onResume = useCallback((): void => {
      if (!CampaignStateMachine.canResume(status)) return;
      void run(() => campaignService.resumeCampaign(campaignId), onChanged);
   }, [status, run, campaignService, campaignId, onChanged]);

   const onEdit = useCallback((): void => {
      if (!CampaignStateMachine.canEdit(status)) return;
      navigate(buildCampaignEditPath(campaignId));
   }, [status, navigate, campaignId]);

   const onRequestCancel = useCallback((): void => {
      if (CampaignStateMachine.canCancel(status)) setIsConfirmingCancel(true);
   }, [status]);

   const onDismissCancel = useCallback((): void => setIsConfirmingCancel(false), []);

   const onConfirmCancel = useCallback((): void => {
      if (!CampaignStateMachine.canCancel(status)) return;
      setIsConfirmingCancel(false);
      void run(() => campaignService.cancelCampaign(campaignId), onChanged);
   }, [status, run, campaignService, campaignId, onChanged]);

   return {
      canStart: CampaignStateMachine.canStart(status),
      canPause: CampaignStateMachine.canPause(status),
      canResume: CampaignStateMachine.canResume(status),
      canCancel: CampaignStateMachine.canCancel(status),
      canEdit: CampaignStateMachine.canEdit(status),
      isBusy,
      isConfirmingCancel,
      editBlockedHint: status === ECampaignStatus.Running ? CAMPAIGN_EDIT_BLOCKED_MESSAGE : null,
      errorMessages,
      onStart,
      onPause,
      onResume,
      onEdit,
      onRequestCancel,
      onConfirmCancel,
      onDismissCancel,
   };
};

export default UseCampaignActionsController;
