using Moq;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices.Base;

namespace PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices;

public sealed class StartCampaignAsyncTests : CampaignCommandServiceSetup
{
    [Fact]
    [Trait("Start", "Perfect setting")]
    public async Task StartCampaignAsync_DraftCampaign_BecomesRunningAndRecordsEvent()
    {
        var campaign = GivenCampaign(ECampaignStatus.Draft);

        var result = await CampaignCommandService.StartCampaignAsync(campaign.Id, BusinessUnitId);

        Assert.True(result);
        Assert.Equal(ECampaignStatus.Running, campaign.Status);
        Assert.Equal(Now, campaign.UpdatedAt);
        var recorded = Assert.Single(RecordedEvents);
        Assert.Equal("CampaignStarted", recorded.Type);
        Assert.Equal(campaign.Id, recorded.CampaignId);
    }

    [Fact]
    [Trait("Start", "Double click")]
    public async Task StartCampaignAsync_CalledTwice_SecondCallIsRefused()
    {
        var campaign = GivenCampaign(ECampaignStatus.Draft);

        var first = await CampaignCommandService.StartCampaignAsync(campaign.Id, BusinessUnitId);
        var second = await CampaignCommandService.StartCampaignAsync(campaign.Id, BusinessUnitId);

        Assert.True(first);
        Assert.False(second);
        Assert.Single(RecordedEvents);
        Assert.Contains("em execução", SingleNotificationMessage());
    }

    [Theory]
    [InlineData(ECampaignStatus.Running)]
    [InlineData(ECampaignStatus.Paused)]
    [InlineData(ECampaignStatus.Completed)]
    [InlineData(ECampaignStatus.Cancelled)]
    [Trait("Start", "Invalid transition")]
    public async Task StartCampaignAsync_StatusOtherThanDraft_ReturnsFalseAndKeepsStatus(ECampaignStatus status)
    {
        var campaign = GivenCampaign(status);

        var result = await CampaignCommandService.StartCampaignAsync(campaign.Id, BusinessUnitId);

        Assert.False(result);
        Assert.Equal(status, campaign.Status);
        CampaignRepository.Verify(r => r.UpdateAsync(It.IsAny<Campaign>()), Times.Never);
        Assert.Empty(RecordedEvents);
    }

    [Fact]
    [Trait("Start", "Security: other tenant")]
    public async Task StartCampaignAsync_UnknownOrOtherTenantCampaign_ReturnsFalse()
    {
        var id = Guid.NewGuid();
        CampaignRepository.Setup(r => r.FindByIdAsync(id, BusinessUnitId, false)).ReturnsAsync((Campaign?)null);

        var result = await CampaignCommandService.StartCampaignAsync(id, BusinessUnitId);

        Assert.False(result);
        Assert.Contains("Campanha", SingleNotificationMessage());
    }

    [Fact]
    [Trait("Start", "Persistence failure")]
    public async Task StartCampaignAsync_RepositoryReturnsFalse_ReturnsFalseWithoutEvent()
    {
        var campaign = GivenCampaign(ECampaignStatus.Draft);
        CampaignRepository.Setup(r => r.UpdateAsync(campaign)).ReturnsAsync(false);

        var result = await CampaignCommandService.StartCampaignAsync(campaign.Id, BusinessUnitId);

        Assert.False(result);
        Assert.Empty(RecordedEvents);
    }
}
