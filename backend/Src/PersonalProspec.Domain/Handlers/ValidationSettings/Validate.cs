using FluentValidation;
using FluentValidation.Results;
using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.Domain.Handlers.ValidationSettings;

public abstract class Validate<T> : AbstractValidator<T>, IValidate<T>
{
    public async Task<ValidationResponse> ValidationAsync(T entity)
    {
        var result = await ValidateAsync(entity);
        return new ValidationResponse(result.IsValid, ToValidationDictionary(result.Errors));
    }

    public ValidationResponse Validation(T entity)
    {
        var result = Validate(entity);
        return new ValidationResponse(result.IsValid, ToValidationDictionary(result.Errors));
    }

    private static Dictionary<string, string[]> ToValidationDictionary(IList<ValidationFailure> failures) =>
        failures
            .GroupBy(f => f.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(f => f.ErrorMessage).ToArray());
}
