using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using NodaTime;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;
using PersonalProspec.Infra.ORM.Contexts;
using PersonalProspec.Infra.Repositories.Base;

namespace PersonalProspec.Infra.Repositories;

public sealed class RefreshTokenRepository(ApplicationContext dbContext)
    : RepositoryBase<RefreshToken>(dbContext), IRefreshTokenRepository
{
    public async Task<bool> SaveAsync(RefreshToken refreshToken)
    {
        await DbSetContext.AddAsync(refreshToken);

        return await SaveInDatabaseAsync();
    }

    public async Task<RefreshToken?> FindByPredicateAsync(
        Expression<Func<RefreshToken, bool>> predicate,
        Func<IQueryable<RefreshToken>, IIncludableQueryable<RefreshToken, object>>? include = null,
        bool toQuery = false)
    {
        IQueryable<RefreshToken> query = DbSetContext;

        query = query.Where(predicate);

        if (toQuery)
            query = query.AsNoTracking();

        if (include is not null)
            query = include(query);

        return await query.FirstOrDefaultAsync();
    }

    public async Task<RefreshToken?> FindByTokenHashAsync(string hash) =>
        await DbSetContext
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.TokenHash == hash);

    public async Task<int> RevokeAllByUserAsync(Guid userId, Instant now) =>
        await DbSetContext
            .IgnoreQueryFilters()
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, (Instant?)now));

    public async Task<bool> RevokeByIdAsync(Guid id, Instant now) =>
        await DbSetContext
            .IgnoreQueryFilters()
            .Where(t => t.Id == id && t.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, (Instant?)now)) == RowsAffected;
}
