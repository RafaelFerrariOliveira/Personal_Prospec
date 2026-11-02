using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;
using PersonalProspec.UnitTest.Api.Controllers.ReferenceControllerTests.Base;

namespace PersonalProspec.UnitTest.Api.Controllers.ReferenceControllerTests;

public sealed class GetStatesReferenceTests : ReferenceControllerSetup
{
    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void GetStates_Metadata_RequiresAdministratorAndIsGetWithRateLimit()
    {
        AssertEndpoint(nameof(ReferenceController.GetStates), "get_states_reference");
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public void GetStates_Always_ReturnsServiceResult()
    {
        IReadOnlyList<StateResponse> states = [new StateResponse { Code = "SP", Name = "São Paulo" }];
        QueryService.Setup(s => s.GetStates()).Returns(states);

        Assert.Same(states, Controller.GetStates());
    }
}
