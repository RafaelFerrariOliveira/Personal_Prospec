using PersonalProspec.ApplicationService.Dtos.AuthenticationDtos.Request;

namespace PersonalProspec.ApplicationService.Interfaces.ServiceContracts;

public interface IAuthenticationCommandService
{
    Task<bool> LoginAsync(LoginRequest request);
    Task<bool> LogoutAsync(Guid userId, Guid businessUnitId);
    Task<bool> RefreshTokenAsync();
}
