namespace PersonalProspec.Domain.Interfaces;

public interface ICurrentTenantContext
{
    Guid BusinessUnitId { get; }
    bool IsSet { get; }
    void SetBusinessUnitId(Guid businessUnitId);
}
