import { Field, FieldError, Input, Label } from './leadCountStep.styles';
import type { ILeadCountStepProps } from './leadCountStep.types';

const LeadCountStep = ({ register, errors, label }: ILeadCountStepProps) => {
   return (
      <Field>
         <Label htmlFor="campaign-target-lead-count">{label}</Label>
         <Input
            id="campaign-target-lead-count"
            type="number"
            inputMode="numeric"
            data-testid="campaign-target-lead-count"
            aria-invalid={Boolean(errors.targetLeadCount)}
            {...register('targetLeadCount', { valueAsNumber: true })}
         />
         {errors.targetLeadCount && (
            <FieldError data-testid="campaign-target-lead-count-error">{errors.targetLeadCount.message}</FieldError>
         )}
      </Field>
   );
};

export default LeadCountStep;
