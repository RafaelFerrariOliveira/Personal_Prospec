using NodaTime;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.Domain.Entities;

// Uma tabela serve linha do tempo, histórico de operações e eventos de autenticação.
// Nunca guarda senha, token, link nem segredo.
public sealed class Event : ITenantOwned
{
    public Guid Id { get; init; }
    public EEventCategory Category { get; set; }
    public required string Type { get; set; }

    // Sem chave estrangeira por enquanto: Company e Campaign só existem nas specs 007 e 001.
    public Guid? CompanyId { get; set; }
    public Guid? CampaignId { get; set; }

    public required string Description { get; set; }
    public required string Source { get; set; }
    public Instant OccurredAt { get; init; }
    public Guid BusinessUnitId { get; init; }
}
