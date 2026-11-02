using NodaTime;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;

namespace PersonalProspec.UnitTest.Builders;

public sealed class CampaignBuilderTest
{
    private Guid _id = Guid.NewGuid();
    private Guid _requestId = Guid.NewGuid();
    private string _name = "Campanha A";
    private string _objective = "Encontrar clientes";
    private string? _idealProfile;
    private string _segment = "Tecnologia";
    private string? _services;
    private string? _differentials;
    private string? _valueProposition;
    private int _targetLeadCount = 50;
    private ECampaignStatus _status = ECampaignStatus.Draft;
    private Guid _businessUnitId = Guid.NewGuid();
    private List<(string State, string Code)> _locations = [("SP", "7107")];
    private List<string> _cnaes = ["6201501"];

    public static CampaignBuilderTest NewObject() => new();

    public Campaign Build()
    {
        var now = Instant.FromUtc(2026, 11, 2, 12, 0, 0);

        return new Campaign
        {
            Id = _id,
            RequestId = _requestId,
            Name = _name,
            Objective = _objective,
            IdealProfile = _idealProfile,
            Segment = _segment,
            Services = _services,
            Differentials = _differentials,
            ValueProposition = _valueProposition,
            TargetLeadCount = _targetLeadCount,
            Status = _status,
            CreatedAt = now,
            UpdatedAt = now,
            BusinessUnitId = _businessUnitId,
            Locations = _locations
                .Select(l => new CampaignLocation
                {
                    Id = Guid.NewGuid(), CampaignId = _id, State = l.State, MunicipalityCode = l.Code,
                    BusinessUnitId = _businessUnitId
                })
                .ToList(),
            Cnaes = _cnaes
                .Select(c => new CampaignCnae
                {
                    Id = Guid.NewGuid(), CampaignId = _id, CnaeCode = c, BusinessUnitId = _businessUnitId
                })
                .ToList()
        };
    }

    public CampaignBuilderTest WithId(Guid id) { _id = id; return this; }
    public CampaignBuilderTest WithRequestId(Guid requestId) { _requestId = requestId; return this; }
    public CampaignBuilderTest WithName(string name) { _name = name; return this; }
    public CampaignBuilderTest WithObjective(string objective) { _objective = objective; return this; }
    public CampaignBuilderTest WithSegment(string segment) { _segment = segment; return this; }
    public CampaignBuilderTest WithIdealProfile(string? value) { _idealProfile = value; return this; }
    public CampaignBuilderTest WithServices(string? value) { _services = value; return this; }
    public CampaignBuilderTest WithDifferentials(string? value) { _differentials = value; return this; }
    public CampaignBuilderTest WithValueProposition(string? value) { _valueProposition = value; return this; }
    public CampaignBuilderTest WithTargetLeadCount(int count) { _targetLeadCount = count; return this; }
    public CampaignBuilderTest WithStatus(ECampaignStatus status) { _status = status; return this; }
    public CampaignBuilderTest WithBusinessUnitId(Guid id) { _businessUnitId = id; return this; }
    public CampaignBuilderTest WithLocations(params (string State, string Code)[] locations) { _locations = [.. locations]; return this; }
    public CampaignBuilderTest WithCnaes(params string[] cnaes) { _cnaes = [.. cnaes]; return this; }
}
