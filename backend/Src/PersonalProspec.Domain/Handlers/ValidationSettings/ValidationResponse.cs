namespace PersonalProspec.Domain.Handlers.ValidationSettings;

public sealed class ValidationResponse(bool isValid, Dictionary<string, string[]> errors)
{
    public bool IsValid { get; } = isValid;
    public Dictionary<string, string[]> Errors { get; } = errors;
}
