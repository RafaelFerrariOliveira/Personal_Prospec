using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Request;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Handlers.PaginationSettings;

namespace PersonalProspec.ApplicationService.Interfaces.MapperContracts;

public interface ICampaignMapper
{
    Campaign CreateRequestToDomain(CreateCampaignRequest dto, Guid businessUnitId);

    // Entidade só para validar a edição: não é rastreada nem gravada.
    Campaign UpdateRequestToCandidate(UpdateCampaignRequest dto, Guid businessUnitId);

    bool IsEquivalent(Campaign existing, CreateCampaignRequest dto);

    IReadOnlyList<string> GetChangedFields(Campaign campaign, UpdateCampaignRequest dto);

    void ApplyUpdate(Campaign campaign, UpdateCampaignRequest dto);

    List<CampaignLocation> ToLocations(IEnumerable<LocationRequest> dto, Guid campaignId, Guid businessUnitId);

    List<CampaignCnae> ToCnaes(IEnumerable<string> codes, Guid campaignId, Guid businessUnitId);

    CampaignListItemResponse DomainToListItemResponse(Campaign campaign);

    PageList<CampaignListItemResponse> DomainToPageResponse(PageList<Campaign> campaigns);

    CampaignDetailResponse DomainToDetailResponse(
        Campaign campaign,
        IReadOnlyList<Municipality> municipalities,
        IReadOnlyList<Cnae> cnaes);

    PageList<CampaignEventResponse> EventsToPageResponse(PageList<Event> events);
}
