namespace PersonalProspec.ApplicationService.Dtos.CampaignDtos.Request;

public sealed record LocationRequest
{
    public required string State { get; set; }
    public required string MunicipalityCode { get; set; }
}
