import { Field, FieldError, Input, Label, Textarea } from './identificationStep.styles';
import type { IIdentificationStepProps } from './identificationStep.types';

const IdentificationStep = ({ register, errors }: IIdentificationStepProps) => {
   return (
      <>
         <Field>
            <Label htmlFor="campaign-name">Nome da campanha</Label>
            <Input
               id="campaign-name"
               data-testid="campaign-name"
               aria-invalid={Boolean(errors.name)}
               {...register('name')}
            />
            {errors.name && <FieldError data-testid="campaign-name-error">{errors.name.message}</FieldError>}
         </Field>
         <Field>
            <Label htmlFor="campaign-objective">Objetivo</Label>
            <Textarea
               id="campaign-objective"
               data-testid="campaign-objective"
               aria-invalid={Boolean(errors.objective)}
               {...register('objective')}
            />
            {errors.objective && (
               <FieldError data-testid="campaign-objective-error">{errors.objective.message}</FieldError>
            )}
         </Field>
      </>
   );
};

export default IdentificationStep;
