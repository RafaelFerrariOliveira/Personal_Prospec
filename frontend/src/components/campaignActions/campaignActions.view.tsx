import Icon from '@components/icon/icon';
import {
   ButtonRow,
   Confirmation,
   ConfirmationActions,
   ConfirmationText,
   ConfirmButton,
   Container,
   DangerButton,
   ErrorList,
   Hint,
   KeepButton,
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
                  <Icon name="play" size="sm" />
                  Iniciar
               </PrimaryButton>
            )}
            {canPause && (
               <SecondaryButton type="button" disabled={isBusy} data-testid="campaign-action-pause" onClick={onPause}>
                  <Icon name="pause" size="sm" />
                  Pausar
               </SecondaryButton>
            )}
            {canResume && (
               <PrimaryButton type="button" disabled={isBusy} data-testid="campaign-action-resume" onClick={onResume}>
                  <Icon name="play" size="sm" />
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
                  <Icon name="stop" size="sm" />
                  Cancelar campanha
               </DangerButton>
            )}
         </ButtonRow>

         {editBlockedHint && <Hint data-testid="campaign-action-edit-hint">{editBlockedHint}</Hint>}

         {isConfirmingCancel && (
            <Confirmation role="alertdialog" aria-label="Confirmar cancelamento" data-testid="campaign-cancel-confirm">
               <ConfirmationText>
                  Cancelar a campanha? Os dados já coletados e o histórico continuam guardados.
               </ConfirmationText>
               <ConfirmationActions>
                  <KeepButton
                     type="button"
                     disabled={isBusy}
                     data-testid="campaign-cancel-confirm-no"
                     onClick={onDismissCancel}
                  >
                     Voltar
                  </KeepButton>
                  <ConfirmButton
                     type="button"
                     disabled={isBusy}
                     data-testid="campaign-cancel-confirm-yes"
                     onClick={onConfirmCancel}
                  >
                     Sim, cancelar
                  </ConfirmButton>
               </ConfirmationActions>
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
