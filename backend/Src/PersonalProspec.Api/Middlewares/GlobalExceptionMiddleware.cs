using PersonalProspec.Domain.Extensions;
using PersonalProspec.Domain.Handlers.NotificationSettings;

namespace PersonalProspec.Api.Middlewares;

// FR-011: exceção não prevista vira 500 genérico, sem stack trace nem mensagem da exceção (inclusive em
// Development). O log guarda só tipo, rota e correlation id; nunca o corpo da requisição.
public sealed class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    public const string NotificationKey = "Server";

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            var correlationId = context.Request.Headers["X-Correlation-Id"].FirstOrDefault() ?? context.TraceIdentifier;

            logger.LogError(
                "Erro não tratado {ExceptionType} em {Method} {Path} (correlation id {CorrelationId})",
                exception.GetType().Name, context.Request.Method, context.Request.Path, correlationId);

            if (context.Response.HasStarted)
                throw;

            context.Response.Clear();
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new[]
            {
                new DomainNotification(NotificationKey, EMessage.UnexpectedError.GetDescription())
            });
        }
    }
}
