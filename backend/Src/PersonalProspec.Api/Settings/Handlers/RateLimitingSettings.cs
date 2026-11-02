using System.Threading.RateLimiting;
using PersonalProspec.Api.Extensions;
using PersonalProspec.Domain.Providers;

namespace PersonalProspec.Api.Settings.Handlers;

public static class RateLimitingSettings
{
    public const string LimitingByUser = "LimitingByUser";

    public static void AddRateLimitingSettings(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            // Por usuário autenticado e, sem autenticação, por IP. No pipeline do padrão o RateLimiter
            // roda antes da Authentication, então na prática a partição acaba sendo por IP.
            options.AddPolicy(LimitingByUser, context =>
            {
                var limit = context.RequestServices.GetRequiredService<RateLimitingOptions>().PermitLimitPerMinute;

                var key = context.User.Identity?.IsAuthenticated == true
                    ? context.User.GetUserId().ToString()
                    : context.Connection.RemoteIpAddress?.ToString() ?? "anonymous";

                return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = limit,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0
                });
            });
        });
    }
}
