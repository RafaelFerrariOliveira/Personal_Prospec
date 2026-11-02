using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Request;
using PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests.Base;

namespace PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests;

public sealed class PauseCampaignTests : CampaignControllerSetup
{
    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void Pause_Metadata_RequiresAdministratorAndIsPostWithRateLimit()
    {
        AssertEndpoint(nameof(CampaignController.Pause), "pause_campaign", "POST");
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task Pause_AuthenticatedUser_PassesIdAndBusinessUnitFromClaim()
    {
        var id = Guid.NewGuid();
        CommandService.Setup(s => s.PauseCampaignAsync(id, BusinessUnitId)).ReturnsAsync(true);

        var result = await Controller.Pause(new CampaignIdRequest { Id = id });

        Assert.True(result);
        CommandService.Verify(s => s.PauseCampaignAsync(id, BusinessUnitId), Times.Once);
    }
}
