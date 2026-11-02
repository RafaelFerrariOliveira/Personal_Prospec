import { useInjection } from '@hooks/useInjection';
import type { IReferenceService } from '@interfaces/reference.interface';
import { ReferenceServiceSymbol } from '@ioc/references/reference.symbols';
import UseCnaeSearchInputController from './cnaeSearchInput.controller';
import type { ICnaeSearchInputProps } from './cnaeSearchInput.types';
import CnaeSearchInputView from './cnaeSearchInput.view';

const CnaeSearchInput = (props: ICnaeSearchInputProps) => {
   const referenceService = useInjection<IReferenceService>(ReferenceServiceSymbol);
   const controller = UseCnaeSearchInputController({ ...props, referenceService });

   return <CnaeSearchInputView {...controller} />;
};

export default CnaeSearchInput;
