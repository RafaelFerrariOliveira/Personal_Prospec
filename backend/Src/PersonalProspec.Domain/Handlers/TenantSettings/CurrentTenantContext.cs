using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.Domain.Handlers.TenantSettings;

public sealed class CurrentTenantContext : ICurrentTenantContext
{
    public Guid BusinessUnitId { get; private set; }
    public bool IsSet { get; private set; }

    public void SetBusinessUnitId(Guid businessUnitId)
    {
        BusinessUnitId = businessUnitId;
        IsSet = true;
    }
}
