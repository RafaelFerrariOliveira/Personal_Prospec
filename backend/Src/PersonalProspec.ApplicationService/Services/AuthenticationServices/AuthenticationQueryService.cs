using Microsoft.AspNetCore.Identity;
using PersonalProspec.ApplicationService.Dtos.AuthenticationDtos.Response;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.Domain.Entities.Identity;

namespace PersonalProspec.ApplicationService.Services.AuthenticationServices;

public sealed class AuthenticationQueryService(UserManager<User> userManager) : IAuthenticationQueryService
{
    public async Task<SessionResponse?> GetSessionAsync(Guid userId, Guid businessUnitId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());

        // O UserManager ignora o filtro de tenant; o businessUnitId entra aqui, como manda a constituição.
        // Mesma resposta (null) para "não existe" e "é de outro tenant".
        if (user is null || user.BusinessUnitId != businessUnitId)
            return null;

        return new SessionResponse { Email = user.Email };
    }
}
