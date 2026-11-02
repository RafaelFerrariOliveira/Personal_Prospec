import type { FormEventHandler } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { NavigateFunction } from 'react-router-dom';
import type { TCnaeLabels } from '@components/cnaeSearchInput/cnaeSearchInput.types';
import type { TMunicipalityLabels } from '@components/municipalityPicker/municipalityPicker.types';
import type { ICampaignService } from '@interfaces/campaign.interface';
import type { TCampaignLocation, TCreateCampaignRequest } from '@request/campaign.request';

export interface ICampaignFormControllerDeps {
   campaignService: ICampaignService;
   navigate: NavigateFunction;
   generateId: () => string;
   /** Presente no modo edição (rota campaigns/:id/edit). */
   campaignId?: string | undefined;
}

/** Campos do formulário que cada passo (components/) recebe por props; a lógica fica no controller. */
export interface ICampaignStepFieldsProps {
   register: UseFormRegister<TCreateCampaignRequest>;
   errors: FieldErrors<TCreateCampaignRequest>;
}

export interface ICampaignSummaryItem {
   label: string;
   value: string;
}

export interface ICampaignFormController {
   title: string;
   isLoading: boolean;
   isNotFound: boolean;
   isBlocked: boolean;
   blockedMessage: string | null;
   loadErrors: string[];
   stepIndex: number;
   stepLabels: string[];
   isFirstStep: boolean;
   isLastStep: boolean;
   register: UseFormRegister<TCreateCampaignRequest>;
   errors: FieldErrors<TCreateCampaignRequest>;
   locations: TCampaignLocation[];
   cityLabels: TMunicipalityLabels;
   cnaeCodes: string[];
   cnaeLabels: TCnaeLabels;
   leadCountLabel: string;
   summary: ICampaignSummaryItem[];
   submitErrors: string[];
   isSubmitting: boolean;
   onLocationsChange: (locations: TCampaignLocation[], labels: TMunicipalityLabels) => void;
   onCnaeChange: (codes: string[], labels: TCnaeLabels) => void;
   onBack: () => void;
   onBackToList: () => void;
   onSubmit: FormEventHandler<HTMLFormElement>;
}

export type ICampaignFormViewProps = ICampaignFormController;
