import MunicipalityPicker from '@components/municipalityPicker/MunicipalityPicker';
import { StepBody } from './locationStep.styles';
import type { ILocationStepProps } from './locationStep.types';

const LocationStep = ({ locations, cityLabels, onLocationsChange, errorMessage }: ILocationStepProps) => {
   return (
      <StepBody data-testid="campaign-location-step">
         <MunicipalityPicker
            value={locations}
            labels={cityLabels}
            onChange={onLocationsChange}
            errorMessage={errorMessage}
         />
      </StepBody>
   );
};

export default LocationStep;
