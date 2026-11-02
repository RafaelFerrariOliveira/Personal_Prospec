using Microsoft.EntityFrameworkCore;
using PersonalProspec.Domain.Providers;
using PersonalProspec.Infra.ORM.Contexts;

namespace PersonalProspec.Api.Settings.Handlers;

public static class DatabaseConnectionSettings
{
    public static void AddDatabaseConnectionSettings(this IServiceCollection services)
    {
        services.AddDbContext<ApplicationContext>((serviceProvider, options) =>
            options.UseSqlServer(
                serviceProvider.GetRequiredService<ConnectionStringOptions>().DefaultConnection));
    }
}
