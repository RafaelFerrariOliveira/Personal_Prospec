using PersonalProspec.Domain.Interfaces.RepositoryContracts;
using PersonalProspec.Infra.Repositories;
using PersonalProspec.Infra.ORM.Seeds;

namespace PersonalProspec.Api.IoC.Containers;

public static class RepositoryContainer
{
    public static void AddRepositoryContainer(this IServiceCollection services)
    {
        // Uma linha por repositório: services.AddScoped<IXxxRepository, XxxRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IEventRepository, EventRepository>();
        services.AddScoped<ICampaignRepository, CampaignRepository>();
        services.AddScoped<IReferenceRepository, ReferenceRepository>();
        services.AddScoped<ReferenceSeed>();
    }
}
