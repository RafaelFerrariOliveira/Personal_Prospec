using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.Domain.Entities;

public sealed class CampaignLocation : ITenantOwned
{
    public Guid Id { get; init; }
    public Guid CampaignId { get; set; }
    public Campaign? Campaign { get; set; }

    // UF da lista fixa de 27 e código do município na Receita (4 dígitos).
    public required string State { get; set; }
    public required string MunicipalityCode { get; set; }
    public Guid BusinessUnitId { get; init; }
}
