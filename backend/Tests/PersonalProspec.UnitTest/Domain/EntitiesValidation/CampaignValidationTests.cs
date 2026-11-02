using PersonalProspec.Domain.EntitiesValidation;
using PersonalProspec.Domain.Providers;
using PersonalProspec.UnitTest.Builders;

namespace PersonalProspec.UnitTest.Domain.EntitiesValidation;

public sealed class CampaignValidationTests
{
    private static readonly CampaignOptions Options = new()
    {
        MaxTargetLeadCount = 500,
        MaxCnaePerCampaign = 20,
        MaxCitiesPerCampaign = 30,
        NameMaxLength = 120,
        ObjectiveMaxLength = 500,
        SegmentMaxLength = 120,
        LongTextMaxLength = 1000
    };

    private readonly CampaignValidation _validation = new(Options);

    [Fact]
    [Trait("Validation", "Perfect setting")]
    public void Validation_ValidCampaign_IsValid()
    {
        var result = _validation.Validation(CampaignBuilderTest.NewObject().Build());

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [Trait("Validation", "Required text")]
    public void Validation_NameEmptyOrOnlySpaces_IsInvalid(string name)
    {
        var result = _validation.Validation(CampaignBuilderTest.NewObject().WithName(name).Build());

        Assert.False(result.IsValid);
        Assert.Contains(nameof(PersonalProspec.Domain.Entities.Campaign.Name), result.Errors.Keys);
    }

    [Theory]
    [InlineData(120, true)]
    [InlineData(121, false)]
    [Trait("Validation", "Max length")]
    public void Validation_NameLength_RespectsLimit(int length, bool expected)
    {
        var result = _validation.Validation(CampaignBuilderTest.NewObject().WithName(new string('a', length)).Build());

        Assert.Equal(expected, result.IsValid);
    }

    [Theory]
    [InlineData(500, true)]
    [InlineData(501, false)]
    [Trait("Validation", "Max length")]
    public void Validation_ObjectiveLength_RespectsLimit(int length, bool expected)
    {
        var result = _validation.Validation(CampaignBuilderTest.NewObject().WithObjective(new string('a', length)).Build());

        Assert.Equal(expected, result.IsValid);
    }

    [Fact]
    [Trait("Validation", "Required text")]
    public void Validation_SegmentOnlySpaces_IsInvalid()
    {
        var result = _validation.Validation(CampaignBuilderTest.NewObject().WithSegment("  ").Build());

        Assert.False(result.IsValid);
    }

    [Theory]
    [InlineData(1000, true)]
    [InlineData(1001, false)]
    [Trait("Validation", "Max length")]
    public void Validation_OptionalLongTexts_RespectLimit(int length, bool expected)
    {
        var text = new string('a', length);

        var result = _validation.Validation(CampaignBuilderTest.NewObject()
            .WithIdealProfile(text).WithServices(text).WithDifferentials(text).WithValueProposition(text).Build());

        Assert.Equal(expected, result.IsValid);
    }

    [Theory]
    [InlineData(1, true)]
    [InlineData(500, true)]
    [InlineData(0, false)]
    [InlineData(-1, false)]
    [InlineData(501, false)]
    [Trait("Validation", "Target lead count")]
    public void Validation_TargetLeadCount_MustBeBetweenOneAndMaximum(int count, bool expected)
    {
        var result = _validation.Validation(CampaignBuilderTest.NewObject().WithTargetLeadCount(count).Build());

        Assert.Equal(expected, result.IsValid);
    }

    [Fact]
    [Trait("Validation", "Locations")]
    public void Validation_NoLocation_IsInvalid()
    {
        var result = _validation.Validation(CampaignBuilderTest.NewObject().WithLocations().Build());

        Assert.False(result.IsValid);
    }

    [Fact]
    [Trait("Validation", "Locations")]
    public void Validation_MoreLocationsThanMaximum_IsInvalid()
    {
        var locations = Enumerable.Range(1, 31).Select(i => ("SP", i.ToString("D4"))).ToArray();

        var result = _validation.Validation(CampaignBuilderTest.NewObject().WithLocations(locations).Build());

        Assert.False(result.IsValid);
    }

    [Fact]
    [Trait("Validation", "Locations")]
    public void Validation_ThirtyLocations_IsValid()
    {
        var locations = Enumerable.Range(1, 30).Select(i => ("SP", i.ToString("D4"))).ToArray();

        var result = _validation.Validation(CampaignBuilderTest.NewObject().WithLocations(locations).Build());

        Assert.True(result.IsValid);
    }

    [Fact]
    [Trait("Validation", "Locations")]
    public void Validation_InvalidState_IsInvalid()
    {
        var result = _validation.Validation(CampaignBuilderTest.NewObject().WithLocations(("XX", "7107")).Build());

        Assert.False(result.IsValid);
    }

    [Fact]
    [Trait("Validation", "Locations")]
    public void Validation_LocationsFromDifferentStates_IsInvalid()
    {
        var result = _validation.Validation(CampaignBuilderTest.NewObject().WithLocations(("SP", "7107"), ("RJ", "6001")).Build());

        Assert.False(result.IsValid);
    }

    [Fact]
    [Trait("Validation", "Locations")]
    public void Validation_RepeatedCity_IsInvalid()
    {
        var result = _validation.Validation(CampaignBuilderTest.NewObject().WithLocations(("SP", "7107"), ("SP", "7107")).Build());

        Assert.False(result.IsValid);
    }

    [Fact]
    [Trait("Validation", "Cnae")]
    public void Validation_NoCnae_IsInvalid()
    {
        var result = _validation.Validation(CampaignBuilderTest.NewObject().WithCnaes().Build());

        Assert.False(result.IsValid);
    }

    [Fact]
    [Trait("Validation", "Cnae")]
    public void Validation_MoreCnaeThanMaximum_IsInvalid()
    {
        var cnaes = Enumerable.Range(1, 21).Select(i => (6200000 + i).ToString()).ToArray();

        var result = _validation.Validation(CampaignBuilderTest.NewObject().WithCnaes(cnaes).Build());

        Assert.False(result.IsValid);
    }

    [Theory]
    [InlineData("123456")]
    [InlineData("12345678")]
    [InlineData("62015a1")]
    [Trait("Validation", "Cnae")]
    public void Validation_CnaeWithWrongFormat_IsInvalid(string code)
    {
        var result = _validation.Validation(CampaignBuilderTest.NewObject().WithCnaes(code).Build());

        Assert.False(result.IsValid);
    }

    [Fact]
    [Trait("Validation", "Cnae")]
    public void Validation_RepeatedCnae_IsInvalid()
    {
        var result = _validation.Validation(CampaignBuilderTest.NewObject().WithCnaes("6201501", "6201501").Build());

        Assert.False(result.IsValid);
    }
}
