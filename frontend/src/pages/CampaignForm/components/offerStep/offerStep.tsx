import { Field, FieldError, Label, Textarea } from './offerStep.styles';
import type { IOfferStepProps } from './offerStep.types';

const OfferStep = ({ register, errors }: IOfferStepProps) => {
   return (
      <>
         <Field>
            <Label htmlFor="campaign-services">Serviços (opcional)</Label>
            <Textarea
               id="campaign-services"
               data-testid="campaign-services"
               aria-invalid={Boolean(errors.services)}
               {...register('services')}
            />
            {errors.services && (
               <FieldError data-testid="campaign-services-error">{errors.services.message}</FieldError>
            )}
         </Field>
         <Field>
            <Label htmlFor="campaign-differentials">Diferenciais (opcional)</Label>
            <Textarea
               id="campaign-differentials"
               data-testid="campaign-differentials"
               aria-invalid={Boolean(errors.differentials)}
               {...register('differentials')}
            />
            {errors.differentials && (
               <FieldError data-testid="campaign-differentials-error">{errors.differentials.message}</FieldError>
            )}
         </Field>
         <Field>
            <Label htmlFor="campaign-value-proposition">Proposta de valor (opcional)</Label>
            <Textarea
               id="campaign-value-proposition"
               data-testid="campaign-value-proposition"
               aria-invalid={Boolean(errors.valueProposition)}
               {...register('valueProposition')}
            />
            {errors.valueProposition && (
               <FieldError data-testid="campaign-value-proposition-error">{errors.valueProposition.message}</FieldError>
            )}
         </Field>
      </>
   );
};

export default OfferStep;
