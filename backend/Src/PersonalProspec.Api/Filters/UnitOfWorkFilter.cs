using Microsoft.AspNetCore.Mvc.Filters;
using PersonalProspec.Api.Extensions;
using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.Api.Filters;

public sealed class UnitOfWorkFilter(IUnitOfWork unitOfWork, INotificationHandler notification)
    : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (context.HttpContext.IsMethodGet())
        {
            await next();
            return;
        }

        await unitOfWork.BeginTransaction();

        try
        {
            var executedContext = await next();

            // Desvio deliberado do login: commit sem olhar notification, senão a contagem de falhas, o
            // bloqueio e o evento de falha nunca persistiriam (ver backend-seguranca-identity).
            if (IsAuthenticationEndPoint(context))
                await LoginMethod(executedContext);
            else
                await OthersMethods(executedContext);
        }
        catch
        {
            await unitOfWork.RollbackTransaction();
            throw;
        }
    }

    // Login e refresh: ambos precisam persistir mesmo terminando com notification (contagem de falhas,
    // bloqueio, evento de falha e a revogação de todos os tokens quando um refresh revogado é reapresentado).
    private static readonly string[] AuthenticationActions = ["generate_access_token", "refresh_token"];

    private static bool IsAuthenticationEndPoint(ActionExecutingContext context)
    {
        var template = context.ActionDescriptor.AttributeRouteInfo?.Template;

        return template is not null &&
               AuthenticationActions.Any(action => template.EndsWith(action, StringComparison.OrdinalIgnoreCase));
    }

    private async Task LoginMethod(ActionExecutedContext context)
    {
        if (context.Exception is null)
            await unitOfWork.CommitTransaction();
        else
            await unitOfWork.RollbackTransaction();
    }

    private async Task OthersMethods(ActionExecutedContext context)
    {
        if (SuccessFlow(context))
            await unitOfWork.CommitTransaction();
        else
            await unitOfWork.RollbackTransaction();
    }

    private bool SuccessFlow(ActionExecutedContext context) =>
        context is { Canceled: false, ModelState.IsValid: true, Exception: null } &&
        !notification.HasNotification();
}
