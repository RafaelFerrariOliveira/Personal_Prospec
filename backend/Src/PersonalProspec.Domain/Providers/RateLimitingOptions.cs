namespace PersonalProspec.Domain.Providers;

// Não é segredo. Valor de partida em appsettings.json; o Rafael ajusta.
public sealed class RateLimitingOptions
{
    public const string SectionName = "RateLimiting";
    public int PermitLimitPerMinute { get; set; }
}
