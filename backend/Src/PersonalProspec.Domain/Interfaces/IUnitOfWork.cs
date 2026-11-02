namespace PersonalProspec.Domain.Interfaces;

public interface IUnitOfWork
{
    Task BeginTransaction();
    Task CommitTransaction();
    Task RollbackTransaction();
}
