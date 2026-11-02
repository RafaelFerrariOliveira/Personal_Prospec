import type { ChangeEvent, RefObject } from 'react';
import type { IReferenceService } from '@interfaces/reference.interface';
import type { TCampaignLocation } from '@request/campaign.request';
import type { TMunicipalityResponse, TStateResponse } from '@response/reference.response';

export type TMunicipalityLabels = Record<string, string>;

export interface IMunicipalityPickerProps {
   value: TCampaignLocation[];
   labels: TMunicipalityLabels;
   onChange: (locations: TCampaignLocation[], labels: TMunicipalityLabels) => void;
   isDisabled?: boolean;
   errorMessage?: string | undefined;
}

export interface IMunicipalityPickerControllerDeps extends IMunicipalityPickerProps {
   referenceService: IReferenceService;
   debounceMs?: number;
}

export interface IMunicipalityItem extends TMunicipalityResponse {
   isSelected: boolean;
}

export interface IMunicipalityPickerController {
   states: TStateResponse[];
   stateCode: string;
   term: string;
   cities: IMunicipalityItem[];
   selected: { code: string; label: string }[];
   isLoadingStates: boolean;
   isLoadingFirstPage: boolean;
   isLoadingMore: boolean;
   hasMore: boolean;
   isEmpty: boolean;
   isLimitReached: boolean;
   isDisabled: boolean;
   /** Falha de rede ao carregar UF ou cidades: mostra "Tentar de novo". */
   loadErrorMessage: string | null;
   /** Erro de validação vindo do formulário: só a mensagem, sem nova tentativa. */
   fieldErrorMessage: string | null;
   listRef: RefObject<HTMLUListElement | null>;
   sentinelRef: (element: HTMLElement | null) => void;
   onStateChange: (event: ChangeEvent<HTMLSelectElement>) => void;
   onTermChange: (event: ChangeEvent<HTMLInputElement>) => void;
   onToggle: (city: TMunicipalityResponse) => void;
   onRemove: (code: string) => void;
   onRetry: () => void;
}

export type IMunicipalityPickerViewProps = IMunicipalityPickerController;
