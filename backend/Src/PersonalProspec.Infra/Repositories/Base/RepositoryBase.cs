using Microsoft.EntityFrameworkCore;
using PersonalProspec.Infra.ORM.Contexts;

namespace PersonalProspec.Infra.Repositories.Base;

public abstract class RepositoryBase<T>(ApplicationContext dbContext) where T : class
{
    protected readonly ApplicationContext DbContext = dbContext;

    protected const int RowsAffected = 1;
    protected DbSet<T> DbSetContext => DbContext.Set<T>();

    protected async Task<bool> SaveInDatabaseAsync() =>
        await DbContext.SaveChangesAsync() >= RowsAffected;
}
