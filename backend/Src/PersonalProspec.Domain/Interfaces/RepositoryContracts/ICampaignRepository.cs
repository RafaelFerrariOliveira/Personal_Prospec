using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Handlers.PaginationSettings;

namespace PersonalProspec.Domain.Interfaces.RepositoryContracts;

public interface ICampaignRepository
{
    Task<bool> SaveAsync(Campaign campaign);

    // Grava as alterações da entidade rastreada (estado e campos simples).
    Task<bool> UpdateAsync(Campaign campaign);

    // Troca localizações e CNAE na mesma gravação dos campos da campanha.
    Task<bool> UpdateWithChildrenAsync(
        Campaign campaign,
        IReadOnlyList<CampaignLocation> locations,
        IReadOnlyList<CampaignCnae> cnaes);

    Task<Campaign?> FindByIdAsync(Guid id, Guid businessUnitId, bool asNoTracking = false);

    Task<Campaign?> FindByRequestIdAsync(Guid requestId, Guid businessUnitId);

    Task<PageList<Campaign>> FindPagedAsync(ECampaignStatus? status, Guid businessUnitId, PageParams pageParams);
}
