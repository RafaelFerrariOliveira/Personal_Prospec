using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;
using PersonalProspec.Domain.Handlers.PaginationSettings;

namespace PersonalProspec.ApplicationService.Interfaces.ServiceContracts;

public interface IReferenceQueryService
{
    IReadOnlyList<StateResponse> GetStates();
    Task<PageList<MunicipalityResponse>> GetMunicipalitiesAsync(string state, string? search, PageParams pageParams);
    Task<IReadOnlyList<CnaeResponse>> SearchCnaeAsync(string? search);
}
