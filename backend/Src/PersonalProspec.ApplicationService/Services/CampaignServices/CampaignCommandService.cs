using Microsoft.EntityFrameworkCore;
using NodaTime;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Request;
using PersonalProspec.ApplicationService.Extensions;
using PersonalProspec.ApplicationService.Interfaces.MapperContracts;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.ApplicationService.Traces;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Extensions;
using PersonalProspec.Domain.Handlers.CampaignSettings;
using PersonalProspec.Domain.Handlers.NotificationSettings;
using PersonalProspec.Domain.Interfaces;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;

namespace PersonalProspec.ApplicationService.Services.CampaignServices;

public sealed class CampaignCommandService(
    INotificationHandler notification,
    ILoggerHandler loggerHandler,
    ICampaignRepository campaignRepository,
    IReferenceRepository referenceRepository,
    ICampaignMapper campaignMapper,
    IValidate<Campaign> campaignValidate,
    CampaignEventRecorder eventRecorder,
    IClock clock)
    : ServiceBase(notification, loggerHandler), ICampaignCommandService
{
    public async Task<bool> CreateCampaignAsync(CreateCampaignRequest request, Guid businessUnitId)
    {
        if (request.RequestId == Guid.Empty)
            return Notification.CreateNotification(
                CampaignTrace.Create,
                EMessage.Required.GetDescription().FormatTo("Chave de solicitação"));

        var existing = await campaignRepository.FindByRequestIdAsync(request.RequestId, businessUnitId);

        if (existing is not null)
            return IsSameRequest(existing, request);

        var campaign = campaignMapper.CreateRequestToDomain(request, businessUnitId);

        if (!await EntityValidationAsync(campaignValidate, campaign))
            return false;

        if (!await ReferencesExistAsync(campaign, CampaignTrace.Create))
            return false;

        try
        {
            if (!await campaignRepository.SaveAsync(campaign))
                return false;
        }
        catch (DbUpdateException)
        {
            // Dois pedidos simultâneos com a mesma chave: o índice único deixa passar só um.
            existing = await campaignRepository.FindByRequestIdAsync(request.RequestId, businessUnitId);

            if (existing is null)
                throw;

            return IsSameRequest(existing, request);
        }

        await eventRecorder.RecordAsync(
            campaign.Id, businessUnitId, CampaignEventRecorder.Created, "Campanha criada em rascunho.");

        return true;
    }

    public async Task<bool> UpdateCampaignAsync(UpdateCampaignRequest request, Guid businessUnitId)
    {
        var campaign = await FindTrackedAsync(request.Id, businessUnitId, CampaignTrace.Update);

        if (campaign is null)
            return false;

        if (!CampaignStateMachine.CanEdit(campaign.Status))
            return Notification.CreateNotification(
                CampaignTrace.Update,
                EMessage.CampaignNotEditable.GetDescription().FormatTo(campaign.Status.ToLabel()));

        var candidate = campaignMapper.UpdateRequestToCandidate(request, businessUnitId);

        if (!await EntityValidationAsync(campaignValidate, candidate))
            return false;

        if (!await ReferencesExistAsync(candidate, CampaignTrace.Update))
            return false;

        var changedFields = campaignMapper.GetChangedFields(campaign, request);

        if (changedFields.Count == 0)
            return true;

        var locations = campaignMapper.ToLocations(request.Locations, campaign.Id, businessUnitId);
        var cnaes = campaignMapper.ToCnaes(request.CnaeCodes, campaign.Id, businessUnitId);

        campaignMapper.ApplyUpdate(campaign, request);

        if (!await campaignRepository.UpdateWithChildrenAsync(campaign, locations, cnaes))
            return false;

        await eventRecorder.RecordAsync(
            campaign.Id, businessUnitId, CampaignEventRecorder.Updated,
            $"Campos alterados: {string.Join(", ", changedFields)}.");

        return true;
    }

    public Task<bool> StartCampaignAsync(Guid id, Guid businessUnitId) =>
        // shortcut: só muda o estado e grava o evento; o enfileiramento da pesquisa entra na spec 003,
        // dentro desta mesma transação.
        ChangeStatusAsync(id, businessUnitId, ECampaignStatus.Running, CampaignTrace.Start, "iniciada",
            CampaignEventRecorder.Started, ECampaignStatus.Draft);

    public Task<bool> PauseCampaignAsync(Guid id, Guid businessUnitId) =>
        ChangeStatusAsync(id, businessUnitId, ECampaignStatus.Paused, CampaignTrace.Pause, "pausada",
            CampaignEventRecorder.Paused);

    public Task<bool> ResumeCampaignAsync(Guid id, Guid businessUnitId) =>
        ChangeStatusAsync(id, businessUnitId, ECampaignStatus.Running, CampaignTrace.Resume, "retomada",
            CampaignEventRecorder.Resumed, ECampaignStatus.Paused);

    public Task<bool> CancelCampaignAsync(Guid id, Guid businessUnitId) =>
        ChangeStatusAsync(id, businessUnitId, ECampaignStatus.Cancelled, CampaignTrace.Cancel, "cancelada",
            CampaignEventRecorder.Cancelled);

    private async Task<bool> ChangeStatusAsync(
        Guid id,
        Guid businessUnitId,
        ECampaignStatus target,
        string trace,
        string actionLabel,
        string eventType,
        ECampaignStatus? requiredFrom = null)
    {
        var campaign = await FindTrackedAsync(id, businessUnitId, trace);

        if (campaign is null)
            return false;

        if (!CampaignStateMachine.CanTransition(campaign.Status, target)
            || (requiredFrom is not null && campaign.Status != requiredFrom))
            return Notification.CreateNotification(
                trace,
                EMessage.CampaignInvalidTransition.GetDescription().FormatTo(campaign.Status.ToLabel(), actionLabel));

        var from = campaign.Status;
        campaign.Status = target;
        campaign.UpdatedAt = clock.GetCurrentInstant();

        if (!await campaignRepository.UpdateAsync(campaign))
            return false;

        await eventRecorder.RecordAsync(
            campaign.Id, businessUnitId, eventType, $"Estado alterado de {from.ToLabel()} para {target.ToLabel()}.");

        return true;
    }

    private async Task<Campaign?> FindTrackedAsync(Guid id, Guid businessUnitId, string trace)
    {
        var campaign = await campaignRepository.FindByIdAsync(id, businessUnitId);

        if (campaign is null)
            Notification.CreateNotification(trace, EMessage.NotFound.GetDescription().FormatTo("Campanha"));

        return campaign;
    }

    private bool IsSameRequest(Campaign existing, CreateCampaignRequest request) =>
        campaignMapper.IsEquivalent(existing, request)
        || Notification.CreateNotification(
            CampaignTrace.Create,
            EMessage.CampaignIdInUse.GetDescription());

    private async Task<bool> ReferencesExistAsync(Campaign campaign, string trace)
    {
        var isValid = true;

        var cnaeCodes = campaign.Cnaes.Select(n => n.CnaeCode).Distinct().ToList();
        var foundCnaes = (await referenceRepository.FindCnaesByCodesAsync(cnaeCodes)).Select(c => c.Code).ToHashSet();

        foreach (var code in cnaeCodes.Where(code => !foundCnaes.Contains(code)))
        {
            Notification.CreateNotification(trace, EMessage.CnaeNotFound.GetDescription().FormatTo(code));
            isValid = false;
        }

        var municipalityCodes = campaign.Locations.Select(l => l.MunicipalityCode).Distinct().ToList();
        var foundMunicipalities = (await referenceRepository.FindMunicipalitiesByCodesAsync(municipalityCodes))
            .ToDictionary(m => m.Code, m => m.State);

        foreach (var location in campaign.Locations)
        {
            if (foundMunicipalities.TryGetValue(location.MunicipalityCode, out var state) && state == location.State)
                continue;

            Notification.CreateNotification(
                trace,
                EMessage.MunicipalityNotInState.GetDescription().FormatTo(location.MunicipalityCode, location.State));
            isValid = false;
        }

        return isValid;
    }
}
