using Moq;
using NodaTime;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Request;
using PersonalProspec.ApplicationService.Mappers;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.UnitTest.Builders;

namespace PersonalProspec.UnitTest.ApplicationService.Mappers;

public sealed class CampaignMapperTests
{
    private static readonly Instant Now = Instant.FromUtc(2026, 11, 2, 12, 0, 0);
    private readonly Guid _businessUnitId = Guid.NewGuid();
    private readonly CampaignMapper _mapper;

    public CampaignMapperTests()
    {
        var clock = new Mock<IClock>();
        clock.Setup(c => c.GetCurrentInstant()).Returns(Now);
        _mapper = new CampaignMapper(clock.Object);
    }

    [Fact]
    [Trait("Mapper", "Create")]
    public void CreateRequestToDomain_ValidRequest_BuildsDraftWithChildrenAndServerId()
    {
        var request = CreateCampaignRequestBuilderTest.NewObject().WithName("  Campanha  ").WithIdealProfile("  ").Build();

        var campaign = _mapper.CreateRequestToDomain(request, _businessUnitId);

        Assert.NotEqual(Guid.Empty, campaign.Id);
        Assert.Equal(request.RequestId, campaign.RequestId);
        Assert.Equal("Campanha", campaign.Name);
        Assert.Null(campaign.IdealProfile);
        Assert.Equal(ECampaignStatus.Draft, campaign.Status);
        Assert.Equal(Now, campaign.CreatedAt);
        Assert.Equal(_businessUnitId, campaign.BusinessUnitId);
        Assert.All(campaign.Locations, l => Assert.Equal(campaign.Id, l.CampaignId));
        Assert.All(campaign.Cnaes, n => Assert.Equal(_businessUnitId, n.BusinessUnitId));
    }

    [Fact]
    [Trait("Mapper", "Create")]
    public void ToLocations_LowercaseState_NormalizesToUpper()
    {
        var locations = _mapper.ToLocations([new LocationRequest { State = " sp ", MunicipalityCode = " 7107 " }], Guid.NewGuid(), _businessUnitId);

        var location = Assert.Single(locations);
        Assert.Equal("SP", location.State);
        Assert.Equal("7107", location.MunicipalityCode);
    }

    [Fact]
    [Trait("Mapper", "IsEquivalent")]
    public void IsEquivalent_SameDataInDifferentOrder_ReturnsTrue()
    {
        var request = CreateCampaignRequestBuilderTest.NewObject()
            .WithLocations(("SP", "7107"), ("SP", "7075")).WithCnaes("6201501", "4711301").Build();
        var existing = CampaignBuilderTest.NewObject()
            .WithLocations(("SP", "7075"), ("SP", "7107")).WithCnaes("4711301", "6201501").Build();

        Assert.True(_mapper.IsEquivalent(existing, request));
    }

    [Fact]
    [Trait("Mapper", "IsEquivalent")]
    public void IsEquivalent_DifferentSegment_ReturnsFalse()
    {
        var request = CreateCampaignRequestBuilderTest.NewObject().WithSegment("Varejo").Build();
        var existing = CampaignBuilderTest.NewObject().Build();

        Assert.False(_mapper.IsEquivalent(existing, request));
    }

    [Fact]
    [Trait("Mapper", "ChangedFields")]
    public void GetChangedFields_OnlyNameAndCnae_ListsExactlyThoseFields()
    {
        var campaign = CampaignBuilderTest.NewObject().Build();
        var request = UpdateCampaignRequestBuilderTest.NewObject().WithName("Outro").WithCnaes("4711301").Build();

        var changed = _mapper.GetChangedFields(campaign, request);

        Assert.Equal(["Name", "Cnaes"], changed);
    }

    [Fact]
    [Trait("Mapper", "ChangedFields")]
    public void GetChangedFields_NoDifference_ReturnsEmpty()
    {
        var campaign = CampaignBuilderTest.NewObject().Build();
        var request = UpdateCampaignRequestBuilderTest.NewObject().Build();

        Assert.Empty(_mapper.GetChangedFields(campaign, request));
    }

    [Fact]
    [Trait("Mapper", "ApplyUpdate")]
    public void ApplyUpdate_Request_MutatesFieldsAndUpdatedAtButNotStatus()
    {
        var campaign = CampaignBuilderTest.NewObject().WithStatus(ECampaignStatus.Paused).Build();
        var request = UpdateCampaignRequestBuilderTest.NewObject().WithName("Outro").WithTargetLeadCount(7).Build();

        _mapper.ApplyUpdate(campaign, request);

        Assert.Equal("Outro", campaign.Name);
        Assert.Equal(7, campaign.TargetLeadCount);
        Assert.Equal(Now, campaign.UpdatedAt);
        Assert.Equal(ECampaignStatus.Paused, campaign.Status);
    }

    [Fact]
    [Trait("Mapper", "ListItem")]
    public void DomainToListItemResponse_ConvertsInstantToUtcDateTime()
    {
        var campaign = CampaignBuilderTest.NewObject().Build();

        var response = _mapper.DomainToListItemResponse(campaign);

        Assert.Equal(DateTimeKind.Utc, response.CreatedAt.Kind);
        Assert.Equal(new DateTime(2026, 11, 2, 12, 0, 0, DateTimeKind.Utc), response.CreatedAt);
    }

    [Fact]
    [Trait("Mapper", "Detail")]
    public void DomainToDetailResponse_SortsLocationsByNameAndCnaesByCode()
    {
        var campaign = CampaignBuilderTest.NewObject()
            .WithLocations(("SP", "2"), ("SP", "1")).WithCnaes("9", "1").Build();
        List<Municipality> municipalities =
        [
            new() { Code = "1", State = "SP", Name = "BAURU" },
            new() { Code = "2", State = "SP", Name = "ADAMANTINA" }
        ];

        var response = _mapper.DomainToDetailResponse(campaign, municipalities, []);

        Assert.Equal(["ADAMANTINA", "BAURU"], response.Locations.Select(l => l.MunicipalityName));
        Assert.Equal(["1", "9"], response.Cnaes.Select(n => n.Code));
    }
}
