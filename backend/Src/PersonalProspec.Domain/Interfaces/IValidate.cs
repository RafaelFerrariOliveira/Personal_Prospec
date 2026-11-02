using PersonalProspec.Domain.Handlers.ValidationSettings;

namespace PersonalProspec.Domain.Interfaces;

public interface IValidate<T>
{
    Task<ValidationResponse> ValidationAsync(T entity);
    ValidationResponse Validation(T entity);
}
