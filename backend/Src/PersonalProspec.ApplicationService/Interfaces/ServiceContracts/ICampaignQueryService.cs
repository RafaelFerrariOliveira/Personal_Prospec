using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;
using PersonalProspec.Domain.Handlers.PaginationSettings;
using PersonalProspec.Domain.Handlers.PaginationSettings.Filters;

namespace PersonalProspec.ApplicationService.Interfaces.ServiceContracts;

public interface ICampaignQueryService
{
    Task<CampaignDetailResponse?> GetByIdCampaignAsync(Guid id, Guid businessUnitId);
    Task<PageList<CampaignListItemResponse>> GetAllWithPaginationCampaignAsync(CampaignPageParams pageParams, Guid businessUnitId);
    Task<PageList<CampaignEventResponse>> GetHistoryCampaignAsync(CampaignHistoryPageParams pageParams, Guid businessUnitId);
}
