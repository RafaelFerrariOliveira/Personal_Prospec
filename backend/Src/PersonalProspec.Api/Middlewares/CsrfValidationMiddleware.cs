using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using PersonalProspec.Domain.Extensions;
using PersonalProspec.Domain.Handlers.NotificationSettings;

namespace PersonalProspec.Api.Middlewares;

// Synchronizer Token. Ignora métodos seguros e endpoints [AllowAnonymous] (regra do padrão). Roda ANTES
// de CORS, RateLimiter e Authentication. Falha vira 400 com notification, sem detalhe técnico.
public sealed class CsrfValidationMiddleware(RequestDelegate next)
{
    public const string NotificationKey = "Csrf";

    public async Task InvokeAsync(HttpContext context, IAntiforgery antiforgery)
    {
        if (IsSafeMethod(context.Request.Method) || IsAnonymousEndpoint(context))
        {
            await next(context);
            return;
        }

        try
        {
            await antiforgery.ValidateRequestAsync(context);
        }
        catch (AntiforgeryValidationException)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new[]
            {
                new DomainNotification(NotificationKey, EMessage.InvalidRequest.GetDescription())
            });
            return;
        }

        await next(context);
    }

    private static bool IsSafeMethod(string method) =>
        HttpMethods.IsGet(method) || HttpMethods.IsHead(method) || HttpMethods.IsOptions(method) ||
        HttpMethods.IsTrace(method);

    private static bool IsAnonymousEndpoint(HttpContext context) =>
        context.GetEndpoint()?.Metadata.GetMetadata<IAllowAnonymous>() is not null;
}
