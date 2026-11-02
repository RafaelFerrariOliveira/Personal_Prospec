import {
   ButtonRow,
   Confirmation,
   Container,
   DangerButton,
   ErrorList,
   Hint,
   PrimaryButton,
   SecondaryButton,
} from './campaignActions.styles';
import type { ICampaignActionsViewProps } from './campaignActions.types';

const CampaignActionsView = ({
   canStart,
   canPause,
   canResume,
   canCancel,
   canEdit,
   isBusy,
   isConfirmingCancel,
   editBlockedHint,
   errorMessages,
   onStart,
   onPause,
   onResume,
   onEdit,
   onRequestCancel,
   onConfirmCancel,
   onDismissCancel,
}: ICampaignActionsViewProps) => {
   return (
      <Container data-testid="campaign-actions">
         <ButtonRow>
            {canStart && (
               <PrimaryButton type="button" disabled={isBusy} data-testid="campaign-action-start" onClick={onStart}>
                  Iniciar
               </PrimaryButton>
            )}
            {canPause && (
               <SecondaryButton type="button" disabled={isBusy} data-testid="campaign-action-pause" onClick={onPause}>
                  Pausar
               </SecondaryButton>
            )}
            {canResume && (
               <PrimaryButton type="button" disabled={isBusy} data-testid="campaign-action-resume" onClick={onResume}>
                  Retomar
               </PrimaryButton>
            )}
            <SecondaryButton
               type="button"
               disabled={isBusy || !canEdit}
               data-testid="campaign-action-edit"
               onClick={onEdit}
            >
               Editar
            </SecondaryButton>
            {canCancel && (
               <DangerButton
                  type="button"
                  disabled={isBusy || isConfirmingCancel}
                  data-testid="campaign-action-cancel"
                  onClick={onRequestCancel}
               >
                  Cancelar campanha
               </DangerButton>
            )}
         </ButtonRow>

         {editBlockedHint && <Hint data-testid="campaign-action-edit-hint">{editBlockedHint}</Hint>}

         {isConfirmingCancel && (
            <Confirmation role="alertdialog" aria-label="Confirmar cancelamento" data-testid="campaign-cancel-confirm">
               <span>Cancelar a campanha? Essa ação não pode ser desfeita.</span>
               <ButtonRow>
                  <DangerButton
                     type="button"
                     disabled={isBusy}
                     data-testid="campaign-cancel-confirm-yes"
                     onClick={onConfirmCancel}
                  >
                     Sim, cancelar
                  </DangerButton>
                  <SecondaryButton
                     type="button"
                     disabled={isBusy}
                     data-testid="campaign-cancel-confirm-no"
                     onClick={onDismissCancel}
                  >
                     Voltar
                  </SecondaryButton>
               </ButtonRow>
            </Confirmation>
         )}

         {errorMessages.length > 0 && (
            <ErrorList role="alert" data-testid="campaign-actions-errors">
               {errorMessages.map((message) => (
                  <li key={message}>{message}</li>
               ))}
            </ErrorList>
         )}
      </Container>
   );
};

export default CampaignActionsView;
