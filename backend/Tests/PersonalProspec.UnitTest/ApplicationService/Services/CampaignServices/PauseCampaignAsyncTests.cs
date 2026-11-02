using Moq;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices.Base;

namespace PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices;

public sealed class PauseCampaignAsyncTests : CampaignCommandServiceSetup
{
    [Fact]
    [Trait("Pause", "Perfect setting")]
    public async Task PauseCampaignAsync_RunningCampaign_BecomesPausedAndRecordsEvent()
    {
        var campaign = GivenCampaign(ECampaignStatus.Running);

        var result = await CampaignCommandService.PauseCampaignAsync(campaign.Id, BusinessUnitId);

        Assert.True(result);
        Assert.Equal(ECampaignStatus.Paused, campaign.Status);
        Assert.Equal("CampaignPaused", Assert.Single(RecordedEvents).Type);
    }

    [Theory]
    [InlineData(ECampaignStatus.Draft)]
    [InlineData(ECampaignStatus.Paused)]
    [InlineData(ECampaignStatus.Completed)]
    [InlineData(ECampaignStatus.Cancelled)]
    [Trait("Pause", "Invalid transition")]
    public async Task PauseCampaignAsync_StatusOtherThanRunning_ReturnsFalseAndKeepsStatus(ECampaignStatus status)
    {
        var campaign = GivenCampaign(status);

        var result = await CampaignCommandService.PauseCampaignAsync(campaign.Id, BusinessUnitId);

        Assert.False(result);
        Assert.Equal(status, campaign.Status);
        CampaignRepository.Verify(r => r.UpdateAsync(It.IsAny<Campaign>()), Times.Never);
        Assert.Empty(RecordedEvents);
    }

    [Fact]
    [Trait("Pause", "Security: other tenant")]
    public async Task PauseCampaignAsync_UnknownOrOtherTenantCampaign_ReturnsFalse()
    {
        var id = Guid.NewGuid();
        CampaignRepository.Setup(r => r.FindByIdAsync(id, BusinessUnitId, false)).ReturnsAsync((Campaign?)null);

        var result = await CampaignCommandService.PauseCampaignAsync(id, BusinessUnitId);

        Assert.False(result);
        Assert.Contains("Campanha", SingleNotificationMessage());
    }
}
