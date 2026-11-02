using PersonalProspec.Domain.Handlers.NotificationSettings;

namespace PersonalProspec.UnitTest.Domain.Handlers.NotificationSettings;

public sealed class NotificationHandlerTests
{
    [Fact]
    [Trait("Notification", "Empty handler")]
    public void HasNotification_NoNotificationCreated_ReturnsFalse()
    {
        var handler = new NotificationHandler();

        Assert.False(handler.HasNotification());
        Assert.Empty(handler.GetNotifications());
    }

    [Fact]
    [Trait("Notification", "Perfect setting")]
    public void CreateNotification_KeyAndValue_StoresNotificationAndReturnsFalse()
    {
        var handler = new NotificationHandler();

        var result = handler.CreateNotification("Chave", "Mensagem");

        Assert.False(result);
        Assert.True(handler.HasNotification());
        var notification = Assert.Single(handler.GetNotifications());
        Assert.Equal("Chave", notification.Key);
        Assert.Equal("Mensagem", notification.Value);
    }

    [Fact]
    [Trait("Notification", "Perfect setting")]
    public void CreateNotification_DomainNotification_StoresNotification()
    {
        var handler = new NotificationHandler();

        handler.CreateNotification(new DomainNotification("Chave", "Mensagem"));

        Assert.Single(handler.GetNotifications());
    }

    [Fact]
    [Trait("Notification", "Perfect setting")]
    public void CreateNotifications_ManyNotifications_StoresAll()
    {
        var handler = new NotificationHandler();
        List<DomainNotification> notifications = [new("A", "1"), new("B", "2")];

        handler.CreateNotifications(notifications);

        Assert.Equal(2, handler.GetNotifications().Count);
    }

    [Fact]
    [Trait("Notification", "Removal")]
    public void DeleteNotification_ExistingKey_RemovesOnlyThatKey()
    {
        var handler = new NotificationHandler();
        handler.CreateNotification("A", "1");
        handler.CreateNotification("B", "2");

        handler.DeleteNotification("A");

        var remaining = Assert.Single(handler.GetNotifications());
        Assert.Equal("B", remaining.Key);
    }
}
