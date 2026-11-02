using PersonalProspec.UnitTest.ApplicationService.Services.ReferenceServices.Base;

namespace PersonalProspec.UnitTest.ApplicationService.Services.ReferenceServices;

public sealed class GetStatesTests : ReferenceQueryServiceSetup
{
    [Fact]
    [Trait("GetStates", "Perfect setting")]
    public void GetStates_Always_ReturnsTheTwentySevenStatesWithoutRepetition()
    {
        var result = ReferenceQueryService.GetStates();

        Assert.Equal(27, result.Count);
        Assert.Equal(27, result.Select(s => s.Code).Distinct().Count());
        Assert.Contains(result, s => s.Code == "DF" && s.Name == "Distrito Federal");
        Assert.Contains(result, s => s.Code == "SP" && s.Name == "São Paulo");
        Assert.All(result, s => Assert.Equal(2, s.Code.Length));
    }
}
