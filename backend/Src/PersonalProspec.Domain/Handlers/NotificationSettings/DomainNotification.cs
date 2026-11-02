namespace PersonalProspec.Domain.Handlers.NotificationSettings;

public sealed class DomainNotification(string key, string value)
{
    public string Key { get; } = key;
    public string Value { get; } = value;
}
