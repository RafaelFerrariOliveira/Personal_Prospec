using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;
using PersonalProspec.ApplicationService.Interfaces.MapperContracts;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.Domain.Handlers.PaginationSettings;
using PersonalProspec.Domain.Handlers.PaginationSettings.Filters;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;

namespace PersonalProspec.ApplicationService.Services.CampaignServices;

public sealed class CampaignQueryService(
    ICampaignRepository campaignRepository,
    IReferenceRepository referenceRepository,
    IEventRepository eventRepository,
    ICampaignMapper campaignMapper)
    : ICampaignQueryService
{
    // Mesma resposta (null) para "não existe" e "é de outro tenant".
    public async Task<CampaignDetailResponse?> GetByIdCampaignAsync(Guid id, Guid businessUnitId)
    {
        var campaign = await campaignRepository.FindByIdAsync(id, businessUnitId, asNoTracking: true);

        if (campaign is null)
            return null;

        var municipalities = await referenceRepository.FindMunicipalitiesByCodesAsync(
            campaign.Locations.Select(l => l.MunicipalityCode).ToList());
        var cnaes = await referenceRepository.FindCnaesByCodesAsync(
            campaign.Cnaes.Select(n => n.CnaeCode).ToList());

        return campaignMapper.DomainToDetailResponse(campaign, municipalities, cnaes);
    }

    public async Task<PageList<CampaignListItemResponse>> GetAllWithPaginationCampaignAsync(
        CampaignPageParams pageParams,
        Guid businessUnitId)
    {
        var campaigns = await campaignRepository.FindPagedAsync(pageParams.Status, businessUnitId, pageParams);

        return campaignMapper.DomainToPageResponse(campaigns);
    }

    // Campanha de outro tenant devolve página vazia, igual a inexistente (o repositório filtra por tenant).
    public async Task<PageList<CampaignEventResponse>> GetHistoryCampaignAsync(
        CampaignHistoryPageParams pageParams,
        Guid businessUnitId)
    {
        var events = await eventRepository.FindByCampaignAsync(pageParams.Id, businessUnitId, pageParams);

        return campaignMapper.EventsToPageResponse(events);
    }
}
