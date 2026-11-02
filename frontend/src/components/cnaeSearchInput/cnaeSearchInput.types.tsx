import type { ChangeEvent } from 'react';
import type { IReferenceService } from '@interfaces/reference.interface';
import type { TCnaeResponse } from '@response/reference.response';

export type TCnaeLabels = Record<string, string>;

export interface ICnaeSearchInputProps {
   value: string[];
   labels: TCnaeLabels;
   onChange: (codes: string[], labels: TCnaeLabels) => void;
   isDisabled?: boolean;
   errorMessage?: string | undefined;
}

export interface ICnaeSearchInputControllerDeps extends ICnaeSearchInputProps {
   referenceService: IReferenceService;
   debounceMs?: number;
}

export interface ICnaeSelectedItem {
   code: string;
   label: string;
}

export interface ICnaeSearchInputController {
   term: string;
   results: TCnaeResponse[];
   selected: ICnaeSelectedItem[];
   isLoading: boolean;
   isEmpty: boolean;
   isDisabled: boolean;
   isLimitReached: boolean;
   hint: string | null;
   errorMessage: string | null;
   onTermChange: (event: ChangeEvent<HTMLInputElement>) => void;
   onSelect: (item: TCnaeResponse) => void;
   onRemove: (code: string) => void;
}

export type ICnaeSearchInputViewProps = ICnaeSearchInputController;
