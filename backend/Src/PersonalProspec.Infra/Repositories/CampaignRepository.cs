using Microsoft.EntityFrameworkCore;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Handlers.PaginationSettings;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;
using PersonalProspec.Infra.Interfaces.ServiceContracts;
using PersonalProspec.Infra.ORM.Contexts;
using PersonalProspec.Infra.Repositories.Base;

namespace PersonalProspec.Infra.Repositories;

public sealed class CampaignRepository(
    ApplicationContext dbContext,
    IPaginationQueryService<Campaign> paginationQueryService)
    : RepositoryBase<Campaign>(dbContext), ICampaignRepository
{
    public async Task<bool> SaveAsync(Campaign campaign)
    {
        await DbSetContext.AddAsync(campaign);

        return await SaveInDatabaseAsync();
    }

    // A campanha chega rastreada (carregada por FindByIdAsync): basta gravar o que mudou.
    public async Task<bool> UpdateAsync(Campaign campaign) => await SaveInDatabaseAsync();

    public async Task<bool> UpdateWithChildrenAsync(
        Campaign campaign,
        IReadOnlyList<CampaignLocation> locations,
        IReadOnlyList<CampaignCnae> cnaes)
    {
        DbContext.Set<CampaignLocation>().RemoveRange(campaign.Locations);
        DbContext.Set<CampaignCnae>().RemoveRange(campaign.Cnaes);

        await DbContext.Set<CampaignLocation>().AddRangeAsync(locations);
        await DbContext.Set<CampaignCnae>().AddRangeAsync(cnaes);

        return await SaveInDatabaseAsync();
    }

    public async Task<Campaign?> FindByIdAsync(Guid id, Guid businessUnitId, bool asNoTracking = false)
    {
        IQueryable<Campaign> query = DbSetContext
            .Include(c => c.Locations)
            .Include(c => c.Cnaes)
            .Where(c => c.Id == id && c.BusinessUnitId == businessUnitId);

        if (asNoTracking)
            query = query.AsNoTracking();

        return await query.FirstOrDefaultAsync();
    }

    public async Task<Campaign?> FindByRequestIdAsync(Guid requestId, Guid businessUnitId) =>
        await DbSetContext
            .Include(c => c.Locations)
            .Include(c => c.Cnaes)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.RequestId == requestId && c.BusinessUnitId == businessUnitId);

    public Task<PageList<Campaign>> FindPagedAsync(
        ECampaignStatus? status,
        Guid businessUnitId,
        PageParams pageParams)
    {
        IQueryable<Campaign> query = DbSetContext
            .Include(c => c.Locations)
            .Where(c => c.BusinessUnitId == businessUnitId);

        if (status is not null)
            query = query.Where(c => c.Status == status);

        return paginationQueryService.CreatePaginationAsync(
            query.OrderByDescending(c => c.CreatedAt),
            pageParams.PageNumber,
            pageParams.PageSize);
    }
}
