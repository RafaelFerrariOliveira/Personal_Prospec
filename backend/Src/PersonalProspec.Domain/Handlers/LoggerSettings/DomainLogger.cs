namespace PersonalProspec.Domain.Handlers.LoggerSettings;

public sealed class DomainLogger
{
    public long Id { get; set; }
    public string? Action { get; set; }
    public string? EntityName { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public required string EntityId { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid UserId { get; set; }
}
