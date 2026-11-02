namespace PersonalProspec.Domain.Providers;

// Só a forma da configuração: o valor vem de user-secrets (dev) ou do variable group (HML/PRD).
public sealed class PepperOptions
{
    public const string SectionName = "Pepper";
    public required string Secret { get; set; }
}
