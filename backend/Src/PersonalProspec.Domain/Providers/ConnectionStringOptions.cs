namespace PersonalProspec.Domain.Providers;

// Só a forma da configuração: o valor vem de user-secrets (dev) ou do variable group (HML/PRD).
public sealed class ConnectionStringOptions
{
    public const string SectionName = "ConnectionStrings";
    public required string DefaultConnection { get; set; }
}
