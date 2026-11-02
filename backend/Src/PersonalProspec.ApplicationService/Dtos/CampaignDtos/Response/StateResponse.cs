namespace PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;

public sealed record StateResponse
{
    public required string Code { get; init; }
    public required string Name { get; init; }
}
