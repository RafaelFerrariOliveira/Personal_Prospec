using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.Domain.Handlers.NotificationSettings;

public sealed class NotificationHandler : INotificationHandler
{
    private readonly List<DomainNotification> _notifications = [];

    public IReadOnlyList<DomainNotification> GetNotifications() => _notifications.AsReadOnly();

    public bool HasNotification() => _notifications.Count > 0;

    public void CreateNotification(DomainNotification notification) =>
        _notifications.Add(notification);

    // Devolve false para permitir "return Notification.CreateNotification(...)" nos Command services.
    public bool CreateNotification(string key, string value)
    {
        _notifications.Add(new DomainNotification(key, value));
        return false;
    }

    public void CreateNotifications(IEnumerable<DomainNotification> notifications) =>
        _notifications.AddRange(notifications);

    public void DeleteNotification(string key) =>
        _notifications.RemoveAll(n => n.Key == key);
}
