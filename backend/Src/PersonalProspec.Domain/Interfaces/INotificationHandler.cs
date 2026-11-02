using PersonalProspec.Domain.Handlers.NotificationSettings;

namespace PersonalProspec.Domain.Interfaces;

public interface INotificationHandler
{
    IReadOnlyList<DomainNotification> GetNotifications();
    bool HasNotification();
    void CreateNotification(DomainNotification notification);
    void CreateNotifications(IEnumerable<DomainNotification> notifications);
    bool CreateNotification(string key, string value);
    void DeleteNotification(string key);
}
