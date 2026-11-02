namespace PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;

public sealed record MunicipalityResponse
{
    public required string Code { get; init; }
    public required string Name { get; init; }
}
