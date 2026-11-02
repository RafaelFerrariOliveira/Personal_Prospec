using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Request;
using PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests.Base;

namespace PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests;

public sealed class StartCampaignTests : CampaignControllerSetup
{
    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void Start_Metadata_RequiresAdministratorAndIsPostWithRateLimit()
    {
        AssertEndpoint(nameof(CampaignController.Start), "start_campaign", "POST");
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task Start_AuthenticatedUser_PassesIdAndBusinessUnitFromClaim()
    {
        var id = Guid.NewGuid();
        CommandService.Setup(s => s.StartCampaignAsync(id, BusinessUnitId)).ReturnsAsync(true);

        var result = await Controller.Start(new CampaignIdRequest { Id = id });

        Assert.True(result);
        CommandService.Verify(s => s.StartCampaignAsync(id, BusinessUnitId), Times.Once);
    }
}
