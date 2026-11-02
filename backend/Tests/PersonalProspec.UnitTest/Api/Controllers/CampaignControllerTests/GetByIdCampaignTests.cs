using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;
using PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests.Base;

namespace PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests;

public sealed class GetByIdCampaignTests : CampaignControllerSetup
{
    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void GetById_Metadata_RequiresAdministratorAndIsGetWithRateLimit()
    {
        AssertEndpoint(nameof(CampaignController.GetById), "get_by_id_campaign", "GET");
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task GetById_AuthenticatedUser_ReturnsServiceResultForBusinessUnitOfClaim()
    {
        var id = Guid.NewGuid();
        var response = new CampaignDetailResponse
        {
            Id = id, Name = "A", Objective = "B", Segment = "C", Locations = [], Cnaes = []
        };
        QueryService.Setup(s => s.GetByIdCampaignAsync(id, BusinessUnitId)).ReturnsAsync(response);

        var result = await Controller.GetById(id);

        Assert.Same(response, result);
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task GetById_ServiceReturnsNull_ReturnsNull()
    {
        var id = Guid.NewGuid();
        QueryService.Setup(s => s.GetByIdCampaignAsync(id, BusinessUnitId)).ReturnsAsync((CampaignDetailResponse?)null);

        Assert.Null(await Controller.GetById(id));
    }
}
