using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;
using PersonalProspec.Domain.Handlers.PaginationSettings;
using PersonalProspec.Domain.Handlers.PaginationSettings.Filters;
using PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests.Base;

namespace PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests;

public sealed class GetHistoryCampaignTests : CampaignControllerSetup
{
    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void GetHistory_Metadata_RequiresAdministratorAndIsGetWithRateLimit()
    {
        AssertEndpoint(nameof(CampaignController.GetHistory), "get_history_campaign", "GET");
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task GetHistory_AuthenticatedUser_PassesParamsAndBusinessUnitFromClaim()
    {
        var pageParams = new CampaignHistoryPageParams { Id = Guid.NewGuid() };
        var page = new PageList<CampaignEventResponse>();
        QueryService.Setup(s => s.GetHistoryCampaignAsync(pageParams, BusinessUnitId)).ReturnsAsync(page);

        var result = await Controller.GetHistory(pageParams);

        Assert.Same(page, result);
    }
}
