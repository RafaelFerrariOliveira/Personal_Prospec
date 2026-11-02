using PersonalProspec.Domain.Handlers.PaginationSettings;

namespace PersonalProspec.Infra.Interfaces.ServiceContracts;

public interface IPaginationQueryService<T> where T : class
{
    Task<PageList<T>> CreatePaginationAsync(IQueryable<T> query, int pageNumber, int pageSize);
}
