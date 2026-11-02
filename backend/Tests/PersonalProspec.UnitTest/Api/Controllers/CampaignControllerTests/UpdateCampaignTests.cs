using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests.Base;
using PersonalProspec.UnitTest.Builders;

namespace PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests;

public sealed class UpdateCampaignTests : CampaignControllerSetup
{
    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void Update_Metadata_RequiresAdministratorAndIsPutWithRateLimit()
    {
        AssertEndpoint(nameof(CampaignController.Update), "update_campaign", "PUT");
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task Update_AuthenticatedUser_PassesBusinessUnitFromClaim()
    {
        var request = UpdateCampaignRequestBuilderTest.NewObject().Build();
        CommandService.Setup(s => s.UpdateCampaignAsync(request, BusinessUnitId)).ReturnsAsync(true);

        var result = await Controller.Update(request);

        Assert.True(result);
        CommandService.Verify(s => s.UpdateCampaignAsync(request, BusinessUnitId), Times.Once);
    }
}
