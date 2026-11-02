namespace PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;

public sealed record CampaignEventResponse
{
    public required string Type { get; init; }
    public required string Description { get; init; }
    public DateTime OccurredAt { get; init; }
}
