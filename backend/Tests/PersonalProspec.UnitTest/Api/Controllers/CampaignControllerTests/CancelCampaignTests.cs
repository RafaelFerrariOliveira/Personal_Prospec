using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Request;
using PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests.Base;

namespace PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests;

public sealed class CancelCampaignTests : CampaignControllerSetup
{
    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void Cancel_Metadata_RequiresAdministratorAndIsPostWithRateLimit()
    {
        AssertEndpoint(nameof(CampaignController.Cancel), "cancel_campaign", "POST");
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task Cancel_AuthenticatedUser_PassesIdAndBusinessUnitFromClaim()
    {
        var id = Guid.NewGuid();
        CommandService.Setup(s => s.CancelCampaignAsync(id, BusinessUnitId)).ReturnsAsync(true);

        var result = await Controller.Cancel(new CampaignIdRequest { Id = id });

        Assert.True(result);
        CommandService.Verify(s => s.CancelCampaignAsync(id, BusinessUnitId), Times.Once);
    }
}
