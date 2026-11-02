using PersonalProspec.Infra.Interfaces.ServiceContracts;
using PersonalProspec.Infra.Services;

namespace PersonalProspec.Api.IoC.Containers;

public static class PaginationContainer
{
    public static void AddPaginationContainer(this IServiceCollection services)
    {
        services.AddScoped(typeof(IPaginationQueryService<>), typeof(PaginationQueryService<>));
    }
}
