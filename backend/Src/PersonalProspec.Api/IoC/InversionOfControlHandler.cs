using NodaTime;
using PersonalProspec.Api.IoC.Containers;
using PersonalProspec.ApplicationService.Handlers;
using PersonalProspec.Domain.Handlers.NotificationSettings;
using PersonalProspec.Domain.Handlers.TenantSettings;
using PersonalProspec.Domain.Interfaces;
using PersonalProspec.Infra.ORM.UoW;

namespace PersonalProspec.Api.IoC;

public static class InversionOfControlHandler
{
    public static void AddInversionOfControlHandler(this IServiceCollection services)
    {
        services.AddScoped<INotificationHandler, NotificationHandler>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<ILoggerHandler, LoggerHandler>();
        services.AddScoped<ICurrentTenantContext, CurrentTenantContext>();

        services.AddSingleton(DateTimeZoneProviders.Tzdb);
        services.AddSingleton<IClock>(SystemClock.Instance);

        services.AddPaginationContainer();
        services.AddRepositoryContainer();
        services.AddServiceContainer();
        services.AddMapperContainer();
        services.AddValidationContainer();
        services.AddAuthenticationContainer();
    }
}
