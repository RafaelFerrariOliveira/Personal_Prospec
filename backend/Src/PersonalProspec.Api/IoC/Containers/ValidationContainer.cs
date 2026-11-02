using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.EntitiesValidation;
using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.Api.IoC.Containers;

public static class ValidationContainer
{
    public static void AddValidationContainer(this IServiceCollection services)
    {
        // Uma linha por validação: services.AddScoped<IValidate<Xxx>, XxxValidation>();
        services.AddScoped<IValidate<Campaign>, CampaignValidation>();
    }
}
