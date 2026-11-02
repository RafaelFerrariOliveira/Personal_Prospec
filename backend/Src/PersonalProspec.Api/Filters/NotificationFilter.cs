using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using PersonalProspec.Domain.Constants;
using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.Api.Filters;

public sealed class NotificationFilter(INotificationHandler notification) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var executedContext = await next();

        if (!notification.HasNotification())
            return;

        var notifications = notification.GetNotifications();

        executedContext.Result = notifications.Any(n => n.Key == CustomClaim.BusinessUnit)
            ? new ObjectResult(notifications) { StatusCode = StatusCodes.Status403Forbidden }
            : new BadRequestObjectResult(notifications);
    }
}
