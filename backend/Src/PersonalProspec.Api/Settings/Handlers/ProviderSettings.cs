using System.Text;
using PersonalProspec.Api.Extensions;
using PersonalProspec.Domain.Constants;
using PersonalProspec.Domain.Providers;

namespace PersonalProspec.Api.Settings.Handlers;

public static class ProviderSettings
{
    // HMAC-SHA256 exige chave de pelo menos 256 bits (32 bytes).
    private const int MinJwtKeyBytes = 32;

    public static void AddProviderSettings(this IServiceCollection services, IConfiguration configuration)
    {
        services.SetConfigureOptionsWithValidation<ConnectionStringOptions>(
            configuration, ConnectionStringOptions.SectionName,
            o => !string.IsNullOrWhiteSpace(o.DefaultConnection),
            "ConnectionStrings:DefaultConnection não configurado.");

        services.SetConfigureOptionsWithValidation<PepperOptions>(
            configuration, PepperOptions.SectionName,
            o => !string.IsNullOrWhiteSpace(o.Secret),
            "Pepper:Secret não configurado.");

        services.SetConfigureOptionsWithValidation<JwtTokenOptions>(
            configuration, JwtTokenOptions.SectionName,
            o => !string.IsNullOrWhiteSpace(o.JwtKey)
                 && Encoding.UTF8.GetByteCount(o.JwtKey) >= MinJwtKeyBytes
                 && !string.IsNullOrWhiteSpace(o.Issuer)
                 && !string.IsNullOrWhiteSpace(o.Audience)
                 && o.AccessTokenMinutes > 0
                 && o.RefreshTokenMinutes > 0,
            "JwtToken não configurado: JwtKey com no mínimo 32 bytes, Issuer, Audience e expirações positivas.");

        services.SetConfigureOptionsWithValidation<SeedOptions>(
            configuration, SeedOptions.SectionName,
            o => !string.IsNullOrWhiteSpace(o.Email) && o.Password is { Length: >= PasswordRules.MinLength },
            "Seed:Email e Seed:Password não configurados (a senha exige o tamanho mínimo).");

        services.SetConfigureOptionsWithValidation<CampaignOptions>(
            configuration, CampaignOptions.SectionName,
            o => o.MaxTargetLeadCount > 0 && o.MaxCnaePerCampaign > 0 && o.MaxCitiesPerCampaign > 0
                 && o.NameMaxLength > 0 && o.ObjectiveMaxLength > 0 && o.SegmentMaxLength > 0 && o.LongTextMaxLength > 0,
            "Campaign: todos os limites devem ser positivos.");

        services.SetConfigureOptionsWithValidation<RateLimitingOptions>(
            configuration, RateLimitingOptions.SectionName,
            o => o.PermitLimitPerMinute > 0,
            "RateLimiting:PermitLimitPerMinute deve ser positivo.");
    }
}
