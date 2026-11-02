using Microsoft.AspNetCore.Mvc.Filters;
using PersonalProspec.Api.Extensions;
using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.Api.Filters;

public sealed class LoggerFilter(ILoggerHandler logger) : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context) { }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        if (context.HttpContext.IsMethodGet())
            return;

        if (logger.HasLogger())
            logger.SaveLogs();
    }
}
