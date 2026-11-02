namespace PersonalProspec.Api.Settings.Handlers;

public static class AntyCsrfSettings
{
    public const string HeaderName = "X-CSRF-TOKEN";

    public static void AddAntyCsrfSettings(this IServiceCollection services)
    {
        services.AddAntiforgery(options =>
        {
            options.HeaderName = HeaderName;
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Cookie.SameSite = SameSiteMode.Strict;
        });
    }
}
