using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Request;

namespace PersonalProspec.ApplicationService.Interfaces.ServiceContracts;

public interface ICampaignCommandService
{
    Task<bool> CreateCampaignAsync(CreateCampaignRequest request, Guid businessUnitId);
    Task<bool> UpdateCampaignAsync(UpdateCampaignRequest request, Guid businessUnitId);
    Task<bool> StartCampaignAsync(Guid id, Guid businessUnitId);
    Task<bool> PauseCampaignAsync(Guid id, Guid businessUnitId);
    Task<bool> ResumeCampaignAsync(Guid id, Guid businessUnitId);
    Task<bool> CancelCampaignAsync(Guid id, Guid businessUnitId);
}
