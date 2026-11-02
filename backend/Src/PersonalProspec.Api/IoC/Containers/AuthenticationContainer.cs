using PersonalProspec.Api.Handlers;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.Infra.ORM.Seeds;

namespace PersonalProspec.Api.IoC.Containers;

public static class AuthenticationContainer
{
    public static void AddAuthenticationContainer(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();

        services.AddScoped<IAuthCookieHandler, AuthCookieHandler>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<InitialSeed>();
    }
}
