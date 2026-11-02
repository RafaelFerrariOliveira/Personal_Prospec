using PersonalProspec.Api.Settings.Handlers;

namespace PersonalProspec.Api.Settings;

public static class SettingsControl
{
    public static void AddSettingsControl(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOpenApi();

        services.AddProviderSettings(configuration);
        services.AddDatabaseConnectionSettings();
        services.AddControllersSettings();
        services.AddFiltersSettings();

        services.AddIdentitySettings();
        services.AddAuthenticationSettings();
        services.AddAuthorizationSettings();
        services.AddRateLimitingSettings();
        services.AddCorsSettings(configuration);
        services.AddAntyCsrfSettings();
    }
}
