using Moq;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Handlers.PaginationSettings;
using PersonalProspec.Domain.Handlers.PaginationSettings.Filters;
using PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices.Base;
using PersonalProspec.UnitTest.Builders;

namespace PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices;

public sealed class GetAllWithPaginationCampaignAsyncTests : CampaignQueryServiceSetup
{
    [Fact]
    [Trait("GetAll", "Perfect setting")]
    public async Task GetAllWithPaginationCampaignAsync_Campaigns_ReturnsMappedPageWithLocationSummary()
    {
        var campaign = CampaignBuilderTest.NewObject()
            .WithBusinessUnitId(BusinessUnitId).WithLocations(("SP", "7107"), ("SP", "7075")).Build();
        var pageParams = new CampaignPageParams { PageNumber = 1, PageSize = 10 };
        CampaignRepository
            .Setup(r => r.FindPagedAsync(null, BusinessUnitId, pageParams))
            .ReturnsAsync(new PageList<Campaign>([campaign], 1, 1, 10));

        var result = await CampaignQueryService.GetAllWithPaginationCampaignAsync(pageParams, BusinessUnitId);

        var item = Assert.Single(result.Items);
        Assert.Equal(campaign.Id, item.Id);
        Assert.Equal("SP, 2 cidades", item.LocationSummary);
        Assert.Equal(1, result.TotalCount);
    }

    [Fact]
    [Trait("GetAll", "Filter")]
    public async Task GetAllWithPaginationCampaignAsync_StatusFilter_PassesStatusToRepository()
    {
        var pageParams = new CampaignPageParams { Status = ECampaignStatus.Paused };
        CampaignRepository
            .Setup(r => r.FindPagedAsync(ECampaignStatus.Paused, BusinessUnitId, pageParams))
            .ReturnsAsync(new PageList<Campaign>([], 0, 1, 10));

        var result = await CampaignQueryService.GetAllWithPaginationCampaignAsync(pageParams, BusinessUnitId);

        Assert.Empty(result.Items);
        CampaignRepository.Verify(r => r.FindPagedAsync(ECampaignStatus.Paused, BusinessUnitId, pageParams), Times.Once);
    }

    [Fact]
    [Trait("GetAll", "Single city")]
    public async Task GetAllWithPaginationCampaignAsync_SingleCity_UsesSingularSummary()
    {
        var campaign = CampaignBuilderTest.NewObject().WithBusinessUnitId(BusinessUnitId).Build();
        var pageParams = new CampaignPageParams();
        CampaignRepository
            .Setup(r => r.FindPagedAsync(null, BusinessUnitId, pageParams))
            .ReturnsAsync(new PageList<Campaign>([campaign], 1, 1, 10));

        var result = await CampaignQueryService.GetAllWithPaginationCampaignAsync(pageParams, BusinessUnitId);

        Assert.Equal("SP, 1 cidade", result.Items[0].LocationSummary);
    }
}
