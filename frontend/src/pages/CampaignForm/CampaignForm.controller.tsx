import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import type { TCnaeLabels } from '@components/cnaeSearchInput/cnaeSearchInput.types';
import type { TMunicipalityLabels } from '@components/municipalityPicker/municipalityPicker.types';
import { CAMPAIGN_LIMITS } from '@domain/campaignLimits';
import { CAMPAIGN_EDIT_BLOCKED_MESSAGE, CampaignStateMachine } from '@domain/campaignStateMachine';
import { useCampaignDetail } from '@hooks/useCampaignDetail';
import {
   ZCreateCampaignRequestSchema,
   type TCampaignLocation,
   type TCreateCampaignRequest,
} from '@request/campaign.request';
import { buildCampaignDetailPath, RoutePaths } from '@routes/routePaths';
import { toApiErrorMessages } from '@utils/apiErrorMessages';
import { formatLocationSummary } from '@utils/formatLocationSummary';
import type { ICampaignFormController, ICampaignFormControllerDeps, ICampaignSummaryItem } from './CampaignForm.types';

type TStepField = FieldPath<TCreateCampaignRequest>;

// label: etapa no indicador (research R7); title: título da seção do cartão (textos do protótipo quando existem).
const STEPS: { label: string; title: string; fields: TStepField[] }[] = [
   { label: 'Identificação', title: 'Sobre a campanha', fields: ['name', 'objective'] },
   { label: 'Localização', title: 'Localização', fields: ['locations'] },
   { label: 'Perfil', title: 'Quem o agente deve encontrar', fields: ['idealProfile', 'segment', 'cnaeCodes'] },
   { label: 'Oferta', title: 'O que você oferece', fields: ['services', 'differentials', 'valueProposition'] },
   { label: 'Quantidade de leads', title: 'Limite da pesquisa', fields: ['targetLeadCount'] },
   { label: 'Resumo', title: 'Resumo', fields: [] },
];

const LAST_STEP_INDEX = STEPS.length - 1;
const GENERIC_ERROR_MESSAGE = 'Não foi possível salvar a campanha. Tente novamente em instantes.';
const NOT_INFORMED = 'Não informado';
const LEAD_COUNT_LABEL = `Quantidade de leads (${CAMPAIGN_LIMITS.minTargetLeadCount} a ${CAMPAIGN_LIMITS.maxTargetLeadCount})`;

const toSummary = (
   values: Partial<TCreateCampaignRequest>,
   cityLabels: TMunicipalityLabels,
   cnaeLabels: TCnaeLabels,
): ICampaignSummaryItem[] => {
   const locations = values.locations ?? [];
   const locationSummary = formatLocationSummary(
      locations.map((location) => ({
         state: location.state,
         name: cityLabels[location.municipalityCode] ?? location.municipalityCode,
      })),
   );
   const cnae = (values.cnaeCodes ?? []).map((code) => (cnaeLabels[code] ? `${code} ${cnaeLabels[code]}` : code));
   const text = (value: string | undefined): string => value?.trim() || NOT_INFORMED;

   return [
      { label: 'Nome', value: text(values.name) },
      { label: 'Objetivo', value: text(values.objective) },
      { label: 'Localização', value: locationSummary || NOT_INFORMED },
      { label: 'Perfil ideal', value: text(values.idealProfile) },
      { label: 'Segmento', value: text(values.segment) },
      { label: 'CNAE', value: cnae.length > 0 ? cnae.join('; ') : NOT_INFORMED },
      { label: 'Serviços', value: text(values.services) },
      { label: 'Diferenciais', value: text(values.differentials) },
      { label: 'Proposta de valor', value: text(values.valueProposition) },
      {
         label: 'Quantidade de leads',
         value: Number.isFinite(values.targetLeadCount) ? String(values.targetLeadCount) : NOT_INFORMED,
      },
   ];
};

const UseCampaignFormController = ({
   campaignService,
   navigate,
   generateId,
   campaignId,
}: ICampaignFormControllerDeps): ICampaignFormController => {
   // requestId nasce ao abrir o formulário e se mantém em reenvios: é a chave de idempotência do duplo clique.
   const [requestId] = useState(generateId);
   const { register, handleSubmit, trigger, setValue, watch, reset, formState } = useForm<TCreateCampaignRequest>({
      resolver: zodResolver(ZCreateCampaignRequestSchema),
      defaultValues: {
         requestId,
         name: '',
         objective: '',
         idealProfile: '',
         segment: '',
         services: '',
         differentials: '',
         valueProposition: '',
         locations: [],
         cnaeCodes: [],
      },
   });
   const [stepIndex, setStepIndex] = useState(0);
   const [cityLabels, setCityLabels] = useState<TMunicipalityLabels>({});
   const [cnaeLabels, setCnaeLabels] = useState<TCnaeLabels>({});
   const [submitErrors, setSubmitErrors] = useState<string[]>([]);
   const isSending = useRef(false);
   const values = watch();
   const isEditMode = Boolean(campaignId);
   const { detail, isLoading, isNotFound, errorMessages } = useCampaignDetail(campaignService, campaignId);
   const hasLoadedDetail = useRef(false);

   // Modo edição: preenche o formulário uma vez com o detalhe; os nomes de cidade e CNAE vêm no próprio detalhe.
   useEffect(() => {
      if (!isEditMode || !detail || hasLoadedDetail.current) return;
      hasLoadedDetail.current = true;
      reset({
         requestId,
         name: detail.name,
         objective: detail.objective,
         idealProfile: detail.idealProfile ?? '',
         segment: detail.segment,
         services: detail.services ?? '',
         differentials: detail.differentials ?? '',
         valueProposition: detail.valueProposition ?? '',
         targetLeadCount: detail.targetLeadCount,
         locations: detail.locations.map(({ state, municipalityCode }) => ({ state, municipalityCode })),
         cnaeCodes: detail.cnaes.map((item) => item.code),
      });
      setCityLabels(Object.fromEntries(detail.locations.map((item) => [item.municipalityCode, item.municipalityName])));
      setCnaeLabels(Object.fromEntries(detail.cnaes.map((item) => [item.code, item.description])));
   }, [isEditMode, detail, reset, requestId]);

   const isBlocked = isEditMode && detail !== null && !CampaignStateMachine.canEdit(detail.status);

   const onLocationsChange = useCallback(
      (locations: TCampaignLocation[], labels: TMunicipalityLabels): void => {
         setCityLabels(labels);
         setValue('locations', locations, { shouldValidate: formState.isSubmitted || locations.length > 0 });
      },
      [setValue, formState.isSubmitted],
   );

   const onCnaeChange = useCallback(
      (codes: string[], labels: TCnaeLabels): void => {
         setCnaeLabels(labels);
         setValue('cnaeCodes', codes, { shouldValidate: formState.isSubmitted || codes.length > 0 });
      },
      [setValue, formState.isSubmitted],
   );

   const onNext = useCallback(async (): Promise<void> => {
      const isStepValid = await trigger(STEPS[stepIndex]?.fields ?? []);
      if (isStepValid) setStepIndex((current) => Math.min(current + 1, LAST_STEP_INDEX));
   }, [trigger, stepIndex]);

   const onBack = useCallback((): void => {
      setStepIndex((current) => Math.max(current - 1, 0));
   }, []);

   const submit = useCallback(
      async (request: TCreateCampaignRequest): Promise<void> => {
         // Trava duplo clique antes de o estado do formulário refletir isSubmitting.
         if (isSending.current) return;
         isSending.current = true;
         setSubmitErrors([]);
         try {
            if (campaignId) {
               const { requestId: _requestId, ...fields } = request;
               const isUpdated = await campaignService.updateCampaign({ id: campaignId, ...fields });
               if (!isUpdated) throw new Error('Resposta inesperada ao salvar a campanha.');
               navigate(buildCampaignDetailPath(campaignId));
            } else {
               const isSaved = await campaignService.createCampaign(request);
               if (!isSaved) throw new Error('Resposta inesperada ao salvar a campanha.');
               navigate(RoutePaths.campaigns, { state: { campaignCreated: true } });
            }
         } catch (error: unknown) {
            // Os dados digitados ficam no formulário e o requestId se mantém para reenviar.
            setSubmitErrors(toApiErrorMessages(error, GENERIC_ERROR_MESSAGE));
         } finally {
            isSending.current = false;
         }
      },
      [campaignService, navigate, campaignId],
   );

   const onBackToList = useCallback((): void => {
      void navigate(RoutePaths.campaigns);
   }, [navigate]);

   const onSubmit = useCallback(
      (event: FormEvent<HTMLFormElement>): Promise<void> | void => {
         if (stepIndex < LAST_STEP_INDEX) {
            event.preventDefault();
            return onNext();
         }
         return handleSubmit(submit)(event);
      },
      [stepIndex, onNext, handleSubmit, submit],
   );

   return {
      title: isEditMode ? 'Editar campanha' : 'Nova campanha',
      isLoading: isEditMode && isLoading,
      isNotFound: isEditMode && isNotFound,
      isBlocked,
      blockedMessage: isBlocked ? CAMPAIGN_EDIT_BLOCKED_MESSAGE : null,
      loadErrors: isEditMode ? errorMessages : [],
      stepIndex,
      stepLabels: STEPS.map((step) => step.label),
      stepTitle: STEPS[stepIndex]?.title ?? '',
      isFirstStep: stepIndex === 0,
      isLastStep: stepIndex === LAST_STEP_INDEX,
      register,
      errors: formState.errors,
      locations: values.locations ?? [],
      cityLabels,
      cnaeCodes: values.cnaeCodes ?? [],
      cnaeLabels,
      leadCountLabel: LEAD_COUNT_LABEL,
      summary: toSummary(values, cityLabels, cnaeLabels),
      submitErrors,
      isSubmitting: formState.isSubmitting,
      onLocationsChange,
      onCnaeChange,
      onBack,
      onBackToList,
      onSubmit,
   };
};

export default UseCampaignFormController;
