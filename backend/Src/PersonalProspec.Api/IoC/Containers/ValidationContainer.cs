namespace PersonalProspec.Api.IoC.Containers;

public static class ValidationContainer
{
    public static void AddValidationContainer(this IServiceCollection services)
    {
        // Uma linha por validação: services.AddScoped<IValidate<Xxx>, XxxValidation>();
    }
}
