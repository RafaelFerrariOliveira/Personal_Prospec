namespace PersonalProspec.Domain.Providers;

// Credenciais da conta única criada pelo seed (decisão A1 da spec 002). Ambos são segredo:
// vêm de user-secrets, são validados na subida e nunca entram em log.
public sealed class SeedOptions
{
    public const string SectionName = "Seed";
    public required string Email { get; set; }
    public required string Password { get; set; }
}
