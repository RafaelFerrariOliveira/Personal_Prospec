using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Handlers.PaginationSettings;

namespace PersonalProspec.Domain.Interfaces.RepositoryContracts;

public interface IEventRepository
{
    Task<bool> SaveAsync(Event @event);

    // Histórico da campanha (categoria Campaign), do mais recente ao mais antigo.
    Task<PageList<Event>> FindByCampaignAsync(Guid campaignId, Guid businessUnitId, PageParams pageParams);
}
