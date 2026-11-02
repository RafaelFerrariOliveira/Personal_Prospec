import { Field, FieldError, FieldHint, Input, Label, RequiredMark } from './leadCountStep.styles';
import type { ILeadCountStepProps } from './leadCountStep.types';

const LeadCountStep = ({ register, errors, label }: ILeadCountStepProps) => {
   return (
      <Field>
         <Label htmlFor="campaign-target-lead-count">
            {label} <RequiredMark aria-hidden="true">*</RequiredMark>
         </Label>
         <Input
            id="campaign-target-lead-count"
            type="number"
            inputMode="numeric"
            data-testid="campaign-target-lead-count"
            aria-invalid={Boolean(errors.targetLeadCount)}
            aria-required="true"
            {...register('targetLeadCount', { valueAsNumber: true })}
         />
         <FieldHint>O agente encerra a pesquisa ao atingir este número.</FieldHint>
         {errors.targetLeadCount && (
            <FieldError data-testid="campaign-target-lead-count-error">{errors.targetLeadCount.message}</FieldError>
         )}
      </Field>
   );
};

export default LeadCountStep;
