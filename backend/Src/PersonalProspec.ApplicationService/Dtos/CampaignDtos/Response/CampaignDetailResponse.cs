using PersonalProspec.Domain.Enums;

namespace PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;

public sealed record CampaignDetailResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Objective { get; init; }
    public string? IdealProfile { get; init; }
    public required string Segment { get; init; }
    public string? Services { get; init; }
    public string? Differentials { get; init; }
    public string? ValueProposition { get; init; }
    public int TargetLeadCount { get; init; }
    public required IReadOnlyList<LocationResponse> Locations { get; init; }
    public required IReadOnlyList<CnaeResponse> Cnaes { get; init; }
    public ECampaignStatus Status { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }

    // Contadores da pesquisa: nulos até as specs 003 e 004 existirem.
    public CampaignProgressResponse? Progress { get; init; }
}

public sealed record CampaignProgressResponse
{
    public int Found { get; init; }
    public int Qualified { get; init; }
    public int Pending { get; init; }
    public int Target { get; init; }
}
