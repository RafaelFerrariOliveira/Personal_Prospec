using PersonalProspec.Domain.Interfaces.RepositoryContracts;
using PersonalProspec.Infra.Repositories;

namespace PersonalProspec.Api.IoC.Containers;

public static class RepositoryContainer
{
    public static void AddRepositoryContainer(this IServiceCollection services)
    {
        // Uma linha por repositório: services.AddScoped<IXxxRepository, XxxRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IEventRepository, EventRepository>();
    }
}
