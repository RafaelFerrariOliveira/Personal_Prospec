using Moq;
using NodaTime;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Handlers.PaginationSettings;
using PersonalProspec.Domain.Handlers.PaginationSettings.Filters;
using PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices.Base;

namespace PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices;

public sealed class GetHistoryCampaignAsyncTests : CampaignQueryServiceSetup
{
    [Fact]
    [Trait("GetHistory", "Perfect setting")]
    public async Task GetHistoryCampaignAsync_Events_ReturnsMappedPage()
    {
        var campaignId = Guid.NewGuid();
        var pageParams = new CampaignHistoryPageParams { Id = campaignId };
        var @event = new Event
        {
            Category = EEventCategory.Campaign,
            Type = "CampaignStarted",
            CampaignId = campaignId,
            Description = "Estado alterado de em rascunho para em execução.",
            Source = "Campaign",
            OccurredAt = Instant.FromUtc(2026, 11, 2, 12, 0, 0),
            BusinessUnitId = BusinessUnitId
        };
        EventRepository
            .Setup(r => r.FindByCampaignAsync(campaignId, BusinessUnitId, pageParams))
            .ReturnsAsync(new PageList<Event>([@event], 1, 1, 10));

        var result = await CampaignQueryService.GetHistoryCampaignAsync(pageParams, BusinessUnitId);

        var item = Assert.Single(result.Items);
        Assert.Equal("CampaignStarted", item.Type);
        Assert.Equal(new DateTime(2026, 11, 2, 12, 0, 0, DateTimeKind.Utc), item.OccurredAt);
    }

    [Fact]
    [Trait("GetHistory", "Security: other tenant")]
    public async Task GetHistoryCampaignAsync_CampaignOfAnotherBusinessUnit_ReturnsEmptyPage()
    {
        var pageParams = new CampaignHistoryPageParams { Id = Guid.NewGuid() };
        EventRepository
            .Setup(r => r.FindByCampaignAsync(pageParams.Id, BusinessUnitId, pageParams))
            .ReturnsAsync(new PageList<Event>());

        var result = await CampaignQueryService.GetHistoryCampaignAsync(pageParams, BusinessUnitId);

        Assert.Empty(result.Items);
        Assert.Equal(0, result.TotalCount);
    }
}
