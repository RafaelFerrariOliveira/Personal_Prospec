using PersonalProspec.Domain.Entities;

namespace PersonalProspec.Domain.Interfaces.RepositoryContracts;

public interface IEventRepository
{
    Task<bool> SaveAsync(Event @event);
}
