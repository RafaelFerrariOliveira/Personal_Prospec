using Microsoft.Extensions.Options;

namespace PersonalProspec.Api.Extensions;

public static class CustomSectionExtension
{
    extension(IServiceCollection services)
    {
        // Todo segredo passa por aqui: a aplicação não sobe se a validação falhar.
        public void SetConfigureOptionsWithValidation<T>(
            IConfiguration configuration,
            string sectionName,
            Func<T, bool> validate,
            string errorMessage) where T : class
        {
            services.AddOptions<T>()
                .Bind(configuration.GetSection(sectionName))
                .Validate(validate, errorMessage)
                .ValidateOnStart();

            services.AddTransient(sp => sp.GetRequiredService<IOptionsMonitor<T>>().CurrentValue);
        }
    }
}
