using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;
using PersonalProspec.Infra.ORM.Contexts;
using PersonalProspec.Infra.Repositories.Base;

namespace PersonalProspec.Infra.Repositories;

public sealed class EventRepository(ApplicationContext dbContext)
    : RepositoryBase<Event>(dbContext), IEventRepository
{
    public async Task<bool> SaveAsync(Event @event)
    {
        await DbSetContext.AddAsync(@event);

        return await SaveInDatabaseAsync();
    }
}
