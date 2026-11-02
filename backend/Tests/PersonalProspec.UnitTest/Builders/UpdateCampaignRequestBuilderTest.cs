using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Request;

namespace PersonalProspec.UnitTest.Builders;

public sealed class UpdateCampaignRequestBuilderTest
{
    private Guid _id = Guid.NewGuid();
    private string _name = "Campanha A";
    private string _objective = "Encontrar clientes";
    private string _segment = "Tecnologia";
    private int _targetLeadCount = 50;
    private List<LocationRequest> _locations = [new() { State = "SP", MunicipalityCode = "7107" }];
    private List<string> _cnaeCodes = ["6201501"];

    public static UpdateCampaignRequestBuilderTest NewObject() => new();

    public UpdateCampaignRequest Build() =>
        new()
        {
            Id = _id,
            Name = _name,
            Objective = _objective,
            Segment = _segment,
            TargetLeadCount = _targetLeadCount,
            Locations = _locations,
            CnaeCodes = _cnaeCodes
        };

    public UpdateCampaignRequestBuilderTest WithId(Guid id) { _id = id; return this; }
    public UpdateCampaignRequestBuilderTest WithName(string name) { _name = name; return this; }
    public UpdateCampaignRequestBuilderTest WithSegment(string segment) { _segment = segment; return this; }
    public UpdateCampaignRequestBuilderTest WithTargetLeadCount(int count) { _targetLeadCount = count; return this; }

    public UpdateCampaignRequestBuilderTest WithLocations(params (string State, string Code)[] locations)
    {
        _locations = locations.Select(l => new LocationRequest { State = l.State, MunicipalityCode = l.Code }).ToList();
        return this;
    }

    public UpdateCampaignRequestBuilderTest WithCnaes(params string[] cnaes) { _cnaeCodes = [.. cnaes]; return this; }
}
