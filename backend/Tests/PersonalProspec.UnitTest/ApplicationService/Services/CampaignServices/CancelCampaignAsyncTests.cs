using Moq;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices.Base;

namespace PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices;

public sealed class CancelCampaignAsyncTests : CampaignCommandServiceSetup
{
    [Theory]
    [InlineData(ECampaignStatus.Draft)]
    [InlineData(ECampaignStatus.Running)]
    [InlineData(ECampaignStatus.Paused)]
    [Trait("Cancel", "Perfect setting")]
    public async Task CancelCampaignAsync_UnfinishedCampaign_BecomesCancelledKeepingData(ECampaignStatus status)
    {
        var campaign = GivenCampaign(status);

        var result = await CampaignCommandService.CancelCampaignAsync(campaign.Id, BusinessUnitId);

        Assert.True(result);
        Assert.Equal(ECampaignStatus.Cancelled, campaign.Status);
        Assert.Single(campaign.Locations);
        Assert.Single(campaign.Cnaes);
        Assert.Equal("CampaignCancelled", Assert.Single(RecordedEvents).Type);
    }

    [Theory]
    [InlineData(ECampaignStatus.Completed)]
    [InlineData(ECampaignStatus.Cancelled)]
    [Trait("Cancel", "Invalid transition")]
    public async Task CancelCampaignAsync_FinishedCampaign_ReturnsFalseAndKeepsStatus(ECampaignStatus status)
    {
        var campaign = GivenCampaign(status);

        var result = await CampaignCommandService.CancelCampaignAsync(campaign.Id, BusinessUnitId);

        Assert.False(result);
        Assert.Equal(status, campaign.Status);
        CampaignRepository.Verify(r => r.UpdateAsync(It.IsAny<Campaign>()), Times.Never);
        Assert.Empty(RecordedEvents);
    }

    [Fact]
    [Trait("Cancel", "Security: other tenant")]
    public async Task CancelCampaignAsync_UnknownOrOtherTenantCampaign_ReturnsFalse()
    {
        var id = Guid.NewGuid();
        CampaignRepository.Setup(r => r.FindByIdAsync(id, BusinessUnitId, false)).ReturnsAsync((Campaign?)null);

        var result = await CampaignCommandService.CancelCampaignAsync(id, BusinessUnitId);

        Assert.False(result);
        Assert.Contains("Campanha", SingleNotificationMessage());
    }
}
