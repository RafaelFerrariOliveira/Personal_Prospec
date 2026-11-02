using Microsoft.AspNetCore.Mvc;
using PersonalProspec.Api.Filters;

namespace PersonalProspec.Api.Settings.Handlers;

public static class FiltersSettings
{
    public static void AddFiltersSettings(this IServiceCollection services)
    {
        services.AddScoped<NotificationFilter>();
        services.AddScoped<UnitOfWorkFilter>();
        services.AddScoped<LoggerFilter>();

        services.Configure<MvcOptions>(options =>
        {
            options.Filters.AddService<NotificationFilter>();
            options.Filters.AddService<UnitOfWorkFilter>();
            options.Filters.AddService<LoggerFilter>();
        });
    }
}
