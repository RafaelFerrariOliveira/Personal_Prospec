using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests.Base;
using PersonalProspec.UnitTest.Builders;

namespace PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests;

public sealed class CreateCampaignTests : CampaignControllerSetup
{
    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void Create_Metadata_RequiresAdministratorAndIsPostWithRateLimit()
    {
        AssertEndpoint(nameof(CampaignController.Create), "create_campaign", "POST");
        Assert.Equal("api/[controller]", ControllerRoute);
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task Create_AuthenticatedUser_PassesBusinessUnitFromClaim()
    {
        var request = CreateCampaignRequestBuilderTest.NewObject().Build();
        CommandService.Setup(s => s.CreateCampaignAsync(request, BusinessUnitId)).ReturnsAsync(true);

        var result = await Controller.Create(request);

        Assert.True(result);
        CommandService.Verify(s => s.CreateCampaignAsync(request, BusinessUnitId), Times.Once);
    }
}
