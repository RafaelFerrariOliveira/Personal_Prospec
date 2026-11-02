import { useInjection } from '@hooks/useInjection';
import type { IReferenceService } from '@interfaces/reference.interface';
import { ReferenceServiceSymbol } from '@ioc/references/reference.symbols';
import UseMunicipalityPickerController from './municipalityPicker.controller';
import type { IMunicipalityPickerProps } from './municipalityPicker.types';
import MunicipalityPickerView from './municipalityPicker.view';

const MunicipalityPicker = (props: IMunicipalityPickerProps) => {
   const referenceService = useInjection<IReferenceService>(ReferenceServiceSymbol);
   const controller = UseMunicipalityPickerController({ ...props, referenceService });

   return <MunicipalityPickerView {...controller} />;
};

export default MunicipalityPicker;
