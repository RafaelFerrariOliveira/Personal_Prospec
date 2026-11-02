namespace PersonalProspec.ApplicationService.Dtos.AntiforgeryDtos.Response;

public sealed record AntiforgeryTokenResponse
{
    public required string Token { get; init; }
}
