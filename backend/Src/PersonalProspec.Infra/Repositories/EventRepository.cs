using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Handlers.PaginationSettings;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;
using PersonalProspec.Infra.Interfaces.ServiceContracts;
using PersonalProspec.Infra.ORM.Contexts;
using PersonalProspec.Infra.Repositories.Base;

namespace PersonalProspec.Infra.Repositories;

public sealed class EventRepository(
    ApplicationContext dbContext,
    IPaginationQueryService<Event> paginationQueryService)
    : RepositoryBase<Event>(dbContext), IEventRepository
{
    public async Task<bool> SaveAsync(Event @event)
    {
        await DbSetContext.AddAsync(@event);

        return await SaveInDatabaseAsync();
    }

    public Task<PageList<Event>> FindByCampaignAsync(Guid campaignId, Guid businessUnitId, PageParams pageParams) =>
        paginationQueryService.CreatePaginationAsync(
            DbSetContext
                .Where(e => e.CampaignId == campaignId
                            && e.BusinessUnitId == businessUnitId
                            && e.Category == EEventCategory.Campaign)
                .OrderByDescending(e => e.OccurredAt),
            pageParams.PageNumber,
            pageParams.PageSize);
}
