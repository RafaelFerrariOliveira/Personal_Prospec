namespace PersonalProspec.ApplicationService.Dtos.CampaignDtos.Request;

public sealed record CreateCampaignRequest
{
    // Chave de idempotência gerada pelo front ao abrir o formulário (FR-013).
    public Guid RequestId { get; set; }
    public required string Name { get; set; }
    public required string Objective { get; set; }
    public string? IdealProfile { get; set; }
    public required string Segment { get; set; }
    public string? Services { get; set; }
    public string? Differentials { get; set; }
    public string? ValueProposition { get; set; }
    public int TargetLeadCount { get; set; }
    public required List<LocationRequest> Locations { get; set; }
    public required List<string> CnaeCodes { get; set; }
}
