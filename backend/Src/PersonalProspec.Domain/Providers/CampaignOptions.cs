namespace PersonalProspec.Domain.Providers;

// Não é segredo. Valores de partida em appsettings.json (sem fonte); o Rafael ajusta.
public sealed class CampaignOptions
{
    public const string SectionName = "Campaign";

    public int MaxTargetLeadCount { get; set; }
    public int MaxCnaePerCampaign { get; set; }
    public int MaxCitiesPerCampaign { get; set; }
    public int NameMaxLength { get; set; }
    public int ObjectiveMaxLength { get; set; }
    public int SegmentMaxLength { get; set; }
    public int LongTextMaxLength { get; set; }
}
