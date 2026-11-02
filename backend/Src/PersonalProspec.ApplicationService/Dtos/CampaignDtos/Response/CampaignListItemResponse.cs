using PersonalProspec.Domain.Enums;

namespace PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;

public sealed record CampaignListItemResponse
{
    public Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Segment { get; init; }
    public required string LocationSummary { get; init; }
    public ECampaignStatus Status { get; init; }
    public DateTime CreatedAt { get; init; }
}
