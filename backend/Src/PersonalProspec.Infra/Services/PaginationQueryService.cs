using Microsoft.EntityFrameworkCore;
using PersonalProspec.Domain.Handlers.PaginationSettings;
using PersonalProspec.Infra.Interfaces.ServiceContracts;

namespace PersonalProspec.Infra.Services;

public sealed class PaginationQueryService<T> : IPaginationQueryService<T> where T : class
{
    public async Task<PageList<T>> CreatePaginationAsync(IQueryable<T> query, int pageNumber, int pageSize)
    {
        var totalCount = await query.CountAsync();
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).AsNoTracking().ToListAsync();

        return new PageList<T>(items.AsReadOnly(), totalCount, pageNumber, pageSize);
    }
}
