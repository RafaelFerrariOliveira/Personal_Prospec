using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.Formatters;

namespace PersonalProspec.Api.Settings.Handlers;

public static class ControllersSettings
{
    public static void AddControllersSettings(this IServiceCollection services)
    {
        services.AddControllers(options =>
            {
                // GetById devolve 200 com null (e não 204) para "não existe" e "é de outro tenant":
                // a mesma resposta nos dois casos evita enumeração (padrão backend-seguranca-identity).
                options.OutputFormatters.RemoveType<HttpNoContentOutputFormatter>();
            })
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });
    }
}
