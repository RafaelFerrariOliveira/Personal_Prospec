using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.Domain.Entities;

public sealed class CampaignCnae : ITenantOwned
{
    public Guid Id { get; init; }
    public Guid CampaignId { get; set; }
    public Campaign? Campaign { get; set; }
    public required string CnaeCode { get; set; }
    public Guid BusinessUnitId { get; init; }
}
