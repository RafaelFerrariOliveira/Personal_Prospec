using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Request;

namespace PersonalProspec.UnitTest.Builders;

public sealed class CreateCampaignRequestBuilderTest
{
    private Guid _requestId = Guid.NewGuid();
    private string _name = "Campanha A";
    private string _objective = "Encontrar clientes";
    private string? _idealProfile;
    private string _segment = "Tecnologia";
    private string? _services;
    private string? _differentials;
    private string? _valueProposition;
    private int _targetLeadCount = 50;
    private List<LocationRequest> _locations = [new() { State = "SP", MunicipalityCode = "7107" }];
    private List<string> _cnaeCodes = ["6201501"];

    public static CreateCampaignRequestBuilderTest NewObject() => new();

    public CreateCampaignRequest Build() =>
        new()
        {
            RequestId = _requestId,
            Name = _name,
            Objective = _objective,
            IdealProfile = _idealProfile,
            Segment = _segment,
            Services = _services,
            Differentials = _differentials,
            ValueProposition = _valueProposition,
            TargetLeadCount = _targetLeadCount,
            Locations = _locations,
            CnaeCodes = _cnaeCodes
        };

    public CreateCampaignRequestBuilderTest WithRequestId(Guid requestId) { _requestId = requestId; return this; }
    public CreateCampaignRequestBuilderTest WithName(string name) { _name = name; return this; }
    public CreateCampaignRequestBuilderTest WithObjective(string objective) { _objective = objective; return this; }
    public CreateCampaignRequestBuilderTest WithSegment(string segment) { _segment = segment; return this; }
    public CreateCampaignRequestBuilderTest WithIdealProfile(string? value) { _idealProfile = value; return this; }
    public CreateCampaignRequestBuilderTest WithServices(string? value) { _services = value; return this; }
    public CreateCampaignRequestBuilderTest WithDifferentials(string? value) { _differentials = value; return this; }
    public CreateCampaignRequestBuilderTest WithValueProposition(string? value) { _valueProposition = value; return this; }
    public CreateCampaignRequestBuilderTest WithTargetLeadCount(int count) { _targetLeadCount = count; return this; }

    public CreateCampaignRequestBuilderTest WithLocations(params (string State, string Code)[] locations)
    {
        _locations = locations.Select(l => new LocationRequest { State = l.State, MunicipalityCode = l.Code }).ToList();
        return this;
    }

    public CreateCampaignRequestBuilderTest WithCnaes(params string[] cnaes) { _cnaeCodes = [.. cnaes]; return this; }
}
