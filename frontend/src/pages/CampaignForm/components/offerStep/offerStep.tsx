import { Field, FieldError, FieldHint, Label, Textarea } from './offerStep.styles';
import type { IOfferStepProps } from './offerStep.types';

const OfferStep = ({ register, errors }: IOfferStepProps) => {
   return (
      <>
         <Field>
            <Label htmlFor="campaign-services">Serviços que desejo oferecer</Label>
            <Textarea
               id="campaign-services"
               placeholder="Ex.: Automação de processos, integração de ERP e dashboards de produção"
               data-testid="campaign-services"
               aria-invalid={Boolean(errors.services)}
               {...register('services')}
            />
            {errors.services && (
               <FieldError data-testid="campaign-services-error">{errors.services.message}</FieldError>
            )}
         </Field>
         <Field>
            <Label htmlFor="campaign-differentials">Diferenciais da minha empresa</Label>
            <Textarea
               id="campaign-differentials"
               placeholder="Ex.: Implantação em 60 dias e equipe especializada no setor"
               data-testid="campaign-differentials"
               aria-invalid={Boolean(errors.differentials)}
               {...register('differentials')}
            />
            <FieldHint>O agente usa seus diferenciais para avaliar a aderência de cada empresa.</FieldHint>
            {errors.differentials && (
               <FieldError data-testid="campaign-differentials-error">{errors.differentials.message}</FieldError>
            )}
         </Field>
         <Field>
            <Label htmlFor="campaign-value-proposition">Proposta de valor</Label>
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
