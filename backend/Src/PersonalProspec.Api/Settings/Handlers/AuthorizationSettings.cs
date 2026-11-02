using PersonalProspec.Domain.UserPolicies;

namespace PersonalProspec.Api.Settings.Handlers;

public static class AuthorizationSettings
{
    public static void AddAuthorizationSettings(this IServiceCollection services)
    {
        services.AddAuthorizationBuilder()
            .AddPolicy(Policy.Administrator, policy => policy.RequireRole(Policy.Administrator))
            // Uma action sem atributo nunca fica pública por esquecimento: quem for público declara
            // [AllowAnonymous] de forma explícita.
            .SetFallbackPolicy(new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build());
    }
}
