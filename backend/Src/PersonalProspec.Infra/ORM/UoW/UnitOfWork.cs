using PersonalProspec.Domain.Interfaces;
using PersonalProspec.Infra.ORM.Contexts;

namespace PersonalProspec.Infra.ORM.UoW;

public sealed class UnitOfWork(ApplicationContext dbContext) : IUnitOfWork
{
    public async Task BeginTransaction()
    {
        await dbContext.Database.BeginTransactionAsync();
    }

    public async Task CommitTransaction()
    {
        try
        {
            await dbContext.Database.CommitTransactionAsync();
        }
        catch
        {
            await RollbackTransaction();
            throw;
        }
    }

    public async Task RollbackTransaction()
    {
        await dbContext.Database.RollbackTransactionAsync();
    }
}
