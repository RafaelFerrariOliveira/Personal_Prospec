using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.ApplicationService.Services.AuthenticationServices;

namespace PersonalProspec.Api.IoC.Containers;

public static class ServiceContainer
{
    public static void AddServiceContainer(this IServiceCollection services)
    {
        // Uma linha por service: services.AddScoped<IXxxQueryService, XxxQueryService>();
        services.AddScoped<AuthEventRecorder>();
        services.AddScoped<IAuthenticationCommandService, AuthenticationCommandService>();
        services.AddScoped<IAuthenticationQueryService, AuthenticationQueryService>();
    }
}
