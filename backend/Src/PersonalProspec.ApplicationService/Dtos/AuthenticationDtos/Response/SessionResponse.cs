namespace PersonalProspec.ApplicationService.Dtos.AuthenticationDtos.Response;

public sealed record SessionResponse
{
    public required string Email { get; init; }
}
