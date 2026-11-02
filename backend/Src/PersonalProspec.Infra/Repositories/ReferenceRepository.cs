using Microsoft.EntityFrameworkCore;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Handlers.PaginationSettings;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;
using PersonalProspec.Infra.Interfaces.ServiceContracts;
using PersonalProspec.Infra.ORM.Contexts;

namespace PersonalProspec.Infra.Repositories;

// Dados de referência públicos, sem tenant. A busca ignora acento e caixa pela collation do SQL Server.
public sealed class ReferenceRepository(
    ApplicationContext dbContext,
    IPaginationQueryService<Municipality> municipalityPagination)
    : IReferenceRepository
{
    private const string CaseAccentInsensitive = "Latin1_General_CI_AI";

    public Task<PageList<Municipality>> GetMunicipalitiesAsync(string state, string? search, PageParams pageParams)
    {
        IQueryable<Municipality> query = dbContext.Set<Municipality>().Where(m => m.State == state);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(m => EF.Functions.Collate(m.Name, CaseAccentInsensitive).Contains(term));
        }

        return municipalityPagination.CreatePaginationAsync(
            query.OrderBy(m => m.Name),
            pageParams.PageNumber,
            pageParams.PageSize);
    }

    public async Task<IReadOnlyList<Cnae>> SearchCnaeAsync(string search, int limit)
    {
        var term = search.Trim();

        return await dbContext.Set<Cnae>()
            .AsNoTracking()
            .Where(c => c.Code.Contains(term)
                        || EF.Functions.Collate(c.Description, CaseAccentInsensitive).Contains(term))
            .OrderBy(c => c.Code)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Cnae>> FindCnaesByCodesAsync(IReadOnlyCollection<string> codes) =>
        await dbContext.Set<Cnae>()
            .AsNoTracking()
            .Where(c => codes.Contains(c.Code))
            .ToListAsync();

    public async Task<IReadOnlyList<Municipality>> FindMunicipalitiesByCodesAsync(
        IReadOnlyCollection<string> codes) =>
        await dbContext.Set<Municipality>()
            .AsNoTracking()
            .Where(m => codes.Contains(m.Code))
            .ToListAsync();
}
