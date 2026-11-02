using NodaTime;
using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.Domain.Entities.Identity;

public sealed class User : ITenantOwned
{
    public Guid Id { get; init; }
    public required string Email { get; set; }
    public required string NormalizedEmail { get; set; }
    public required string PasswordHash { get; set; }
    public required string SecurityStamp { get; set; }
    public int AccessFailedCount { get; set; }
    public bool LockoutEnabled { get; set; } = true;
    public Instant? LockoutEnd { get; set; }
    public Guid RoleId { get; set; }
    public Role? Role { get; set; }
    public Instant CreatedAt { get; init; }
    public Guid BusinessUnitId { get; init; }
}
