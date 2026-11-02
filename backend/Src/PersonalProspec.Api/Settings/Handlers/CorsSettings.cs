namespace PersonalProspec.Api.Settings.Handlers;

public static class CorsSettings
{
    public const string PolicyName = "FrontendPolicy";
    public const string AllowedOriginsKey = "Cors:AllowedOrigins";

    // Sem origem configurada o CORS fica restrito: em dev o Vite faz proxy de /api e a origem é a mesma.
    // AllowCredentials só com origem explícita, nunca com curinga.
    public static void AddCorsSettings(this IServiceCollection services, IConfiguration configuration)
    {
        var origins = configuration.GetSection(AllowedOriginsKey).Get<string[]>() ?? [];

        services.AddCors(options =>
            options.AddPolicy(PolicyName, policy =>
            {
                policy.WithOrigins(origins)
                    .WithMethods("GET", "POST", "PUT", "DELETE")
                    .WithHeaders("Content-Type", "X-CSRF-TOKEN", "X-Correlation-Id");

                if (origins.Length > 0)
                    policy.AllowCredentials();
            }));
    }
}
