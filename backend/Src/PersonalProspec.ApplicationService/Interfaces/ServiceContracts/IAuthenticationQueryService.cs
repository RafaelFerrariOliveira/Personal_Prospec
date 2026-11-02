using PersonalProspec.ApplicationService.Dtos.AuthenticationDtos.Response;

namespace PersonalProspec.ApplicationService.Interfaces.ServiceContracts;

public interface IAuthenticationQueryService
{
    Task<SessionResponse?> GetSessionAsync(Guid userId, Guid businessUnitId);
}
