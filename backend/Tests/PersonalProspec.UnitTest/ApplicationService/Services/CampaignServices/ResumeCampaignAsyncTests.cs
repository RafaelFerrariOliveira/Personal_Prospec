using Moq;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices.Base;

namespace PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices;

public sealed class ResumeCampaignAsyncTests : CampaignCommandServiceSetup
{
    [Fact]
    [Trait("Resume", "Perfect setting")]
    public async Task ResumeCampaignAsync_PausedCampaign_BecomesRunningAndRecordsEvent()
    {
        var campaign = GivenCampaign(ECampaignStatus.Paused);

        var result = await CampaignCommandService.ResumeCampaignAsync(campaign.Id, BusinessUnitId);

        Assert.True(result);
        Assert.Equal(ECampaignStatus.Running, campaign.Status);
        Assert.Equal("CampaignResumed", Assert.Single(RecordedEvents).Type);
    }

    [Theory]
    [InlineData(ECampaignStatus.Draft)]
    [InlineData(ECampaignStatus.Running)]
    [InlineData(ECampaignStatus.Completed)]
    [InlineData(ECampaignStatus.Cancelled)]
    [Trait("Resume", "Invalid transition")]
    public async Task ResumeCampaignAsync_StatusOtherThanPaused_ReturnsFalseAndKeepsStatus(ECampaignStatus status)
    {
        var campaign = GivenCampaign(status);

        var result = await CampaignCommandService.ResumeCampaignAsync(campaign.Id, BusinessUnitId);

        Assert.False(result);
        Assert.Equal(status, campaign.Status);
        CampaignRepository.Verify(r => r.UpdateAsync(It.IsAny<Campaign>()), Times.Never);
        Assert.Empty(RecordedEvents);
    }

    [Fact]
    [Trait("Resume", "Security: other tenant")]
    public async Task ResumeCampaignAsync_UnknownOrOtherTenantCampaign_ReturnsFalse()
    {
        var id = Guid.NewGuid();
        CampaignRepository.Setup(r => r.FindByIdAsync(id, BusinessUnitId, false)).ReturnsAsync((Campaign?)null);

        var result = await CampaignCommandService.ResumeCampaignAsync(id, BusinessUnitId);

        Assert.False(result);
        Assert.Contains("Campanha", SingleNotificationMessage());
    }
}
