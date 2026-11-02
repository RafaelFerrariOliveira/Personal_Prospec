namespace PersonalProspec.ApplicationService.Dtos.AuthenticationDtos.Request;

public sealed record LoginRequest
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}
