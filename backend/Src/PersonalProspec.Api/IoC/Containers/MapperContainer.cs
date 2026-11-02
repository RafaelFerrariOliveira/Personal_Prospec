using PersonalProspec.ApplicationService.Interfaces.MapperContracts;
using PersonalProspec.ApplicationService.Mappers;

namespace PersonalProspec.Api.IoC.Containers;

public static class MapperContainer
{
    public static void AddMapperContainer(this IServiceCollection services)
    {
        // Uma linha por mapper: services.AddScoped<IXxxMapper, XxxMapper>();
        services.AddScoped<ICampaignMapper, CampaignMapper>();
    }
}
