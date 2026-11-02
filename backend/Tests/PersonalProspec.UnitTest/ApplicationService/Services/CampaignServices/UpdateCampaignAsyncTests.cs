using Moq;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices.Base;
using PersonalProspec.UnitTest.Builders;

namespace PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices;

public sealed class UpdateCampaignAsyncTests : CampaignCommandServiceSetup
{
    [Theory]
    [InlineData(ECampaignStatus.Draft)]
    [InlineData(ECampaignStatus.Paused)]
    [Trait("Update", "Perfect setting")]
    public async Task UpdateCampaignAsync_EditableStatus_AppliesChangesAndRecordsChangedFieldNames(ECampaignStatus status)
    {
        var campaign = GivenCampaign(status);
        var request = UpdateCampaignRequestBuilderTest.NewObject()
            .WithId(campaign.Id).WithName("Novo nome").WithTargetLeadCount(80).Build();

        var result = await CampaignCommandService.UpdateCampaignAsync(request, BusinessUnitId);

        Assert.True(result);
        Assert.Equal("Novo nome", campaign.Name);
        Assert.Equal(80, campaign.TargetLeadCount);
        var recorded = Assert.Single(RecordedEvents);
        Assert.Equal("CampaignUpdated", recorded.Type);
        Assert.Contains("Name", recorded.Description);
        Assert.Contains("TargetLeadCount", recorded.Description);
        Assert.DoesNotContain("Novo nome", recorded.Description);
    }

    [Fact]
    [Trait("Update", "Children")]
    public async Task UpdateCampaignAsync_LocationAndCnaeChanged_ReplacesChildren()
    {
        var campaign = GivenCampaign(ECampaignStatus.Paused);
        var request = UpdateCampaignRequestBuilderTest.NewObject()
            .WithId(campaign.Id).WithLocations(("SP", "7107"), ("SP", "7075")).WithCnaes("4711301").Build();

        var result = await CampaignCommandService.UpdateCampaignAsync(request, BusinessUnitId);

        Assert.True(result);
        CampaignRepository.Verify(r => r.UpdateWithChildrenAsync(
            campaign,
            It.Is<IReadOnlyList<CampaignLocation>>(l => l.Count == 2),
            It.Is<IReadOnlyList<CampaignCnae>>(n => n.Count == 1 && n[0].CnaeCode == "4711301")), Times.Once);
        Assert.Contains("Locations", RecordedEvents.Single().Description);
        Assert.Contains("Cnaes", RecordedEvents.Single().Description);
    }

    [Theory]
    [InlineData(ECampaignStatus.Running)]
    [InlineData(ECampaignStatus.Completed)]
    [InlineData(ECampaignStatus.Cancelled)]
    [Trait("Update", "Not editable")]
    public async Task UpdateCampaignAsync_StatusNotEditable_ReturnsFalseAndChangesNothing(ECampaignStatus status)
    {
        var campaign = GivenCampaign(status);
        var request = UpdateCampaignRequestBuilderTest.NewObject().WithId(campaign.Id).WithName("Novo nome").Build();

        var result = await CampaignCommandService.UpdateCampaignAsync(request, BusinessUnitId);

        Assert.False(result);
        Assert.Equal("Campanha A", campaign.Name);
        Assert.Contains("Pausada", SingleNotificationMessage());
        CampaignRepository.Verify(r => r.UpdateWithChildrenAsync(
            It.IsAny<Campaign>(), It.IsAny<IReadOnlyList<CampaignLocation>>(), It.IsAny<IReadOnlyList<CampaignCnae>>()), Times.Never);
        Assert.Empty(RecordedEvents);
    }

    [Fact]
    [Trait("Update", "No changes")]
    public async Task UpdateCampaignAsync_NothingChanged_ReturnsTrueWithoutWritingOrEvent()
    {
        var campaign = GivenCampaign(ECampaignStatus.Draft);
        var request = UpdateCampaignRequestBuilderTest.NewObject().WithId(campaign.Id).Build();

        var result = await CampaignCommandService.UpdateCampaignAsync(request, BusinessUnitId);

        Assert.True(result);
        CampaignRepository.Verify(r => r.UpdateWithChildrenAsync(
            It.IsAny<Campaign>(), It.IsAny<IReadOnlyList<CampaignLocation>>(), It.IsAny<IReadOnlyList<CampaignCnae>>()), Times.Never);
        Assert.Empty(RecordedEvents);
    }

    [Fact]
    [Trait("Update", "Validation")]
    public async Task UpdateCampaignAsync_InvalidData_ReturnsFalseAndKeepsOriginal()
    {
        var campaign = GivenCampaign(ECampaignStatus.Draft);
        var request = UpdateCampaignRequestBuilderTest.NewObject().WithId(campaign.Id).WithName("  ").Build();

        var result = await CampaignCommandService.UpdateCampaignAsync(request, BusinessUnitId);

        Assert.False(result);
        Assert.Equal("Campanha A", campaign.Name);
        Assert.Empty(RecordedEvents);
    }

    [Fact]
    [Trait("Update", "References")]
    public async Task UpdateCampaignAsync_UnknownCnae_ReturnsFalse()
    {
        var campaign = GivenCampaign(ECampaignStatus.Draft);
        var request = UpdateCampaignRequestBuilderTest.NewObject().WithId(campaign.Id).WithCnaes("9999999").Build();
        ReferenceRepository
            .Setup(r => r.FindCnaesByCodesAsync(It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync((IReadOnlyList<Cnae>)[]);

        var result = await CampaignCommandService.UpdateCampaignAsync(request, BusinessUnitId);

        Assert.False(result);
        Assert.Contains("9999999", SingleNotificationMessage());
    }

    [Fact]
    [Trait("Update", "Security: other tenant")]
    public async Task UpdateCampaignAsync_CampaignOfAnotherBusinessUnit_ReturnsFalseLikeUnknown()
    {
        var request = UpdateCampaignRequestBuilderTest.NewObject().Build();
        CampaignRepository
            .Setup(r => r.FindByIdAsync(request.Id, BusinessUnitId, false))
            .ReturnsAsync((Campaign?)null);

        var result = await CampaignCommandService.UpdateCampaignAsync(request, BusinessUnitId);

        Assert.False(result);
        Assert.Contains("Campanha", SingleNotificationMessage());
    }
}
