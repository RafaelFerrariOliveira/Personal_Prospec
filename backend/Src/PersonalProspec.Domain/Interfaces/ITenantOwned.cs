namespace PersonalProspec.Domain.Interfaces;

public interface ITenantOwned
{
    Guid BusinessUnitId { get; }
}
