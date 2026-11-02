using PersonalProspec.Domain.Enums;

namespace PersonalProspec.Domain.Handlers.PaginationSettings.Filters;

public sealed class CampaignPageParams : PageParams
{
    public ECampaignStatus? Status { get; init; }
}
