import CnaeSearchInput from '@components/cnaeSearchInput/CnaeSearchInput';
import { Field, FieldError, FieldHint, Input, Label, RequiredMark, Textarea } from './profileStep.styles';
import type { IProfileStepProps } from './profileStep.types';

const ProfileStep = ({ register, errors, cnaeCodes, cnaeLabels, onCnaeChange }: IProfileStepProps) => {
   return (
      <>
         <Field>
            <Label htmlFor="campaign-segment">
               Segmento de empresas <RequiredMark aria-hidden="true">*</RequiredMark>
            </Label>
            <Input
               id="campaign-segment"
               placeholder="Ex.: Indústria e manufatura"
               data-testid="campaign-segment"
               aria-invalid={Boolean(errors.segment)}
               aria-required="true"
               {...register('segment')}
            />
            {errors.segment && <FieldError data-testid="campaign-segment-error">{errors.segment.message}</FieldError>}
         </Field>
         <Field>
            <Label htmlFor="campaign-ideal-profile">Perfil de cliente ideal (ICP)</Label>
            <Textarea
               id="campaign-ideal-profile"
               placeholder="Ex.: Empresas com 100 a 500 funcionários, em expansão e com processos ainda manuais"
               data-testid="campaign-ideal-profile"
               aria-invalid={Boolean(errors.idealProfile)}
               {...register('idealProfile')}
            />
            <FieldHint>Porte, momento da empresa e sinais que indicam boa oportunidade.</FieldHint>
            {errors.idealProfile && (
               <FieldError data-testid="campaign-ideal-profile-error">{errors.idealProfile.message}</FieldError>
            )}
         </Field>
         <CnaeSearchInput
            value={cnaeCodes}
            labels={cnaeLabels}
            onChange={onCnaeChange}
            errorMessage={errors.cnaeCodes?.message}
         />
      </>
   );
};

export default ProfileStep;
