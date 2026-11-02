using NodaTime;
using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.Domain.Entities.Identity;

public sealed class RefreshToken : ITenantOwned
{
    public Guid Id { get; init; }
    public Guid UserId { get; set; }
    public User? User { get; set; }

    // Só o hash é gravado; o valor cru vai para o cookie e nunca para o banco.
    public required string TokenHash { get; set; }
    public Instant ExpiresAt { get; set; }
    public Instant? RevokedAt { get; set; }
    public Instant CreatedAt { get; init; }
    public Guid BusinessUnitId { get; init; }
}
