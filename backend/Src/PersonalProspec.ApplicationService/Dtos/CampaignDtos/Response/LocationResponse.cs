namespace PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;

public sealed record LocationResponse
{
    public required string State { get; init; }
    public required string MunicipalityCode { get; init; }
    public required string MunicipalityName { get; init; }
}
