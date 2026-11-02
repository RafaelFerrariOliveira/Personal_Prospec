using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.Domain.Constants;
using PersonalProspec.Domain.Handlers.PaginationSettings;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;

namespace PersonalProspec.ApplicationService.Services.ReferenceServices;

public sealed class ReferenceQueryService(IReferenceRepository referenceRepository) : IReferenceQueryService
{
    private const int MinSearchLength = 2;
    private const int CnaeSearchLimit = 20;

    public IReadOnlyList<StateResponse> GetStates() =>
        BrazilianStates.All.Select(s => new StateResponse { Code = s.Code, Name = s.Name }).ToList();

    public async Task<PageList<MunicipalityResponse>> GetMunicipalitiesAsync(
        string state,
        string? search,
        PageParams pageParams)
    {
        var code = (state ?? string.Empty).Trim().ToUpperInvariant();

        if (!BrazilianStates.IsValid(code))
            return new PageList<MunicipalityResponse>();

        var page = await referenceRepository.GetMunicipalitiesAsync(code, search, pageParams);

        return new PageList<MunicipalityResponse>(
            page.Items.Select(m => new MunicipalityResponse { Code = m.Code, Name = m.Name }).ToList(),
            page.TotalCount, page.PageNumber, page.PageSize);
    }

    public async Task<IReadOnlyList<CnaeResponse>> SearchCnaeAsync(string? search)
    {
        if (search is null || search.Trim().Length < MinSearchLength)
            return [];

        var cnaes = await referenceRepository.SearchCnaeAsync(search, CnaeSearchLimit);

        return cnaes.Select(c => new CnaeResponse { Code = c.Code, Description = c.Description }).ToList();
    }
}
