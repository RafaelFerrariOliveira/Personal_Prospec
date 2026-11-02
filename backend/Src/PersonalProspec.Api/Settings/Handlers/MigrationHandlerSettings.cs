using Microsoft.EntityFrameworkCore;
using PersonalProspec.Infra.ORM.Contexts;
using PersonalProspec.Infra.ORM.Seeds;

namespace PersonalProspec.Api.Settings.Handlers;

public static class MigrationHandlerSettings
{
    public static async Task MigrateDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var appContext = scope.ServiceProvider.GetRequiredService<ApplicationContext>();

        await appContext.Database.MigrateAsync();

        await scope.ServiceProvider.GetRequiredService<InitialSeed>().RunAsync();
    }
}
