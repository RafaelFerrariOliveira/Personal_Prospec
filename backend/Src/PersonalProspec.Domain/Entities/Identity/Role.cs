namespace PersonalProspec.Domain.Entities.Identity;

public sealed class Role
{
    public Guid Id { get; init; }
    public required string Name { get; set; }
    public required string NormalizedName { get; set; }
}
