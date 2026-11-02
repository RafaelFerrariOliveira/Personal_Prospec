namespace PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;

public sealed record CnaeResponse
{
    public required string Code { get; init; }
    public required string Description { get; init; }
}
