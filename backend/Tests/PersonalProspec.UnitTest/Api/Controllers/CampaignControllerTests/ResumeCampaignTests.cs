using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Request;
using PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests.Base;

namespace PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests;

public sealed class ResumeCampaignTests : CampaignControllerSetup
{
    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void Resume_Metadata_RequiresAdministratorAndIsPostWithRateLimit()
    {
        AssertEndpoint(nameof(CampaignController.Resume), "resume_campaign", "POST");
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task Resume_AuthenticatedUser_PassesIdAndBusinessUnitFromClaim()
    {
        var id = Guid.NewGuid();
        CommandService.Setup(s => s.ResumeCampaignAsync(id, BusinessUnitId)).ReturnsAsync(true);

        var result = await Controller.Resume(new CampaignIdRequest { Id = id });

        Assert.True(result);
        CommandService.Verify(s => s.ResumeCampaignAsync(id, BusinessUnitId), Times.Once);
    }
}
