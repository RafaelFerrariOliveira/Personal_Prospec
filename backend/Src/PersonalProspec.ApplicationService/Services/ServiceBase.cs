using PersonalProspec.Domain.Handlers.LoggerSettings;
using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.ApplicationService.Services;

public abstract class ServiceBase(INotificationHandler notification, ILoggerHandler loggerHandler)
{
    protected readonly INotificationHandler Notification = notification;

    protected async Task<bool> EntityValidationAsync<T>(IValidate<T> validate, T entity)
    {
        var response = await validate.ValidationAsync(entity);

        if (!response.IsValid)
        {
            foreach (var error in response.Errors)
            foreach (var message in error.Value)
                Notification.CreateNotification(error.Key, message);

            return false;
        }

        return true;
    }

    protected void GenerateLogger(DomainLogger logger)
    {
        loggerHandler.CreateLogger(logger);
    }
}
