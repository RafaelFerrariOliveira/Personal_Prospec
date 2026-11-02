namespace PersonalProspec.Domain.Providers;

// JwtKey é segredo (user-secrets / variable group). As expirações são a única fonte de validade
// dos tokens e dos cookies: não duplicar número em outro lugar.
public sealed class JwtTokenOptions
{
    public const string SectionName = "JwtToken";
    public required string JwtKey { get; set; }
    public required string Issuer { get; set; }
    public required string Audience { get; set; }
    public int AccessTokenMinutes { get; set; }
    public int RefreshTokenMinutes { get; set; }
}
