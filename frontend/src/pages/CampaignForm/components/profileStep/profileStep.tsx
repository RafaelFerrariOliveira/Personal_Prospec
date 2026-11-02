import CnaeSearchInput from '@components/cnaeSearchInput/CnaeSearchInput';
import { Field, FieldError, Input, Label, Textarea } from './profileStep.styles';
import type { IProfileStepProps } from './profileStep.types';

const ProfileStep = ({ register, errors, cnaeCodes, cnaeLabels, onCnaeChange }: IProfileStepProps) => {
   return (
      <>
         <Field>
            <Label htmlFor="campaign-ideal-profile">Perfil ideal (opcional)</Label>
            <Textarea
               id="campaign-ideal-profile"
               data-testid="campaign-ideal-profile"
               aria-invalid={Boolean(errors.idealProfile)}
               {...register('idealProfile')}
            />
            {errors.idealProfile && (
               <FieldError data-testid="campaign-ideal-profile-error">{errors.idealProfile.message}</FieldError>
            )}
         </Field>
         <Field>
            <Label htmlFor="campaign-segment">Segmento</Label>
            <Input
               id="campaign-segment"
               data-testid="campaign-segment"
               aria-invalid={Boolean(errors.segment)}
               {...register('segment')}
            />
            {errors.segment && <FieldError data-testid="campaign-segment-error">{errors.segment.message}</FieldError>}
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
