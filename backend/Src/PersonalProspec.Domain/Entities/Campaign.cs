using NodaTime;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.Domain.Entities;

public sealed class Campaign : ITenantOwned
{
    public Guid Id { get; init; }

    // Chave de idempotência enviada pelo front em create_campaign (FR-013); única por unidade.
    public Guid RequestId { get; init; }

    public required string Name { get; set; }
    public required string Objective { get; set; }
    public string? IdealProfile { get; set; }
    public required string Segment { get; set; }
    public string? Services { get; set; }
    public string? Differentials { get; set; }
    public string? ValueProposition { get; set; }
    public int TargetLeadCount { get; set; }
    public ECampaignStatus Status { get; set; }
    public Instant CreatedAt { get; init; }
    public Instant UpdatedAt { get; set; }
    public Guid BusinessUnitId { get; init; }
    public byte[] RowVersion { get; set; } = [];

    public List<CampaignLocation> Locations { get; set; } = [];
    public List<CampaignCnae> Cnaes { get; set; } = [];
}
