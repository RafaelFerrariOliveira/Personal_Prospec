using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;
using PersonalProspec.Domain.Handlers.PaginationSettings;
using PersonalProspec.Domain.Handlers.PaginationSettings.Filters;
using PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests.Base;

namespace PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests;

public sealed class GetAllWithPaginationCampaignTests : CampaignControllerSetup
{
    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void GetAllWithPagination_Metadata_RequiresAdministratorAndIsGetWithRateLimit()
    {
        AssertEndpoint(nameof(CampaignController.GetAllWithPagination), "get_all_with_pagination_campaign", "GET");
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task GetAllWithPagination_AuthenticatedUser_PassesParamsAndBusinessUnitFromClaim()
    {
        var pageParams = new CampaignPageParams { PageNumber = 2 };
        var page = new PageList<CampaignListItemResponse>();
        QueryService.Setup(s => s.GetAllWithPaginationCampaignAsync(pageParams, BusinessUnitId)).ReturnsAsync(page);

        var result = await Controller.GetAllWithPagination(pageParams);

        Assert.Same(page, result);
    }
}
