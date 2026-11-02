import { Field, FieldError, Input, Label, RequiredMark, Textarea } from './identificationStep.styles';
import type { IIdentificationStepProps } from './identificationStep.types';

const IdentificationStep = ({ register, errors }: IIdentificationStepProps) => {
   return (
      <>
         <Field>
            <Label htmlFor="campaign-name">
               Nome da campanha <RequiredMark aria-hidden="true">*</RequiredMark>
            </Label>
            <Input
               id="campaign-name"
               placeholder="Ex.: Indústrias de médio porte em Campinas"
               data-testid="campaign-name"
               aria-invalid={Boolean(errors.name)}
               aria-required="true"
               {...register('name')}
            />
            {errors.name && <FieldError data-testid="campaign-name-error">{errors.name.message}</FieldError>}
         </Field>
         <Field>
            <Label htmlFor="campaign-objective">
               Objetivo da prospecção <RequiredMark aria-hidden="true">*</RequiredMark>
            </Label>
            <Textarea
               id="campaign-objective"
               placeholder="Ex.: Oferecer automação de processos para indústrias com 100 a 500 funcionários"
               data-testid="campaign-objective"
               aria-invalid={Boolean(errors.objective)}
               aria-required="true"
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
