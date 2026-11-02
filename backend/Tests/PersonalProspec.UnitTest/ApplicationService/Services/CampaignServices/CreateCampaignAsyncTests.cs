using Microsoft.EntityFrameworkCore;
using Moq;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices.Base;
using PersonalProspec.UnitTest.Builders;

namespace PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices;

public sealed class CreateCampaignAsyncTests : CampaignCommandServiceSetup
{
    [Fact]
    [Trait("Create", "Perfect setting")]
    public async Task CreateCampaignAsync_ValidRequest_SavesDraftAndRecordsEvent()
    {
        var request = CreateCampaignRequestBuilderTest.NewObject().Build();
        Campaign? saved = null;
        CampaignRepository.Setup(r => r.SaveAsync(It.IsAny<Campaign>())).Callback<Campaign>(c => saved = c).ReturnsAsync(true);

        var result = await CampaignCommandService.CreateCampaignAsync(request, BusinessUnitId);

        Assert.True(result);
        Assert.NotNull(saved);
        Assert.Equal(ECampaignStatus.Draft, saved.Status);
        Assert.Equal(request.RequestId, saved.RequestId);
        Assert.NotEqual(Guid.Empty, saved.Id);
        Assert.Equal(BusinessUnitId, saved.BusinessUnitId);
        Assert.Equal(Now, saved.CreatedAt);
        Assert.Single(saved.Locations);
        Assert.Single(saved.Cnaes);
        Assert.False(Notification.HasNotification());

        var recorded = Assert.Single(RecordedEvents);
        Assert.Equal("CampaignCreated", recorded.Type);
        Assert.Equal(EEventCategory.Campaign, recorded.Category);
        Assert.Equal(saved.Id, recorded.CampaignId);
    }

    [Fact]
    [Trait("Create", "Normalization")]
    public async Task CreateCampaignAsync_TextWithSpaces_SavesTrimmedAndOptionalEmptyAsNull()
    {
        var request = CreateCampaignRequestBuilderTest.NewObject()
            .WithName("  Campanha A  ").WithIdealProfile("   ").Build();
        Campaign? saved = null;
        CampaignRepository.Setup(r => r.SaveAsync(It.IsAny<Campaign>())).Callback<Campaign>(c => saved = c).ReturnsAsync(true);

        await CampaignCommandService.CreateCampaignAsync(request, BusinessUnitId);

        Assert.Equal("Campanha A", saved!.Name);
        Assert.Null(saved.IdealProfile);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [Trait("Create", "Required fields")]
    public async Task CreateCampaignAsync_NameEmptyOrOnlySpaces_ReturnsFalseAndSavesNothing(string name)
    {
        var request = CreateCampaignRequestBuilderTest.NewObject().WithName(name).Build();

        var result = await CampaignCommandService.CreateCampaignAsync(request, BusinessUnitId);

        Assert.False(result);
        Assert.True(Notification.HasNotification());
        CampaignRepository.Verify(r => r.SaveAsync(It.IsAny<Campaign>()), Times.Never);
        Assert.Empty(RecordedEvents);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    [InlineData(501)]
    [Trait("Create", "Target lead count")]
    public async Task CreateCampaignAsync_TargetLeadCountOutOfRange_ReturnsFalse(int count)
    {
        var request = CreateCampaignRequestBuilderTest.NewObject().WithTargetLeadCount(count).Build();

        var result = await CampaignCommandService.CreateCampaignAsync(request, BusinessUnitId);

        Assert.False(result);
        CampaignRepository.Verify(r => r.SaveAsync(It.IsAny<Campaign>()), Times.Never);
    }

    [Fact]
    [Trait("Create", "Lists")]
    public async Task CreateCampaignAsync_EmptyLocationsAndCnaes_ReturnsFalseWithBothMessages()
    {
        var request = CreateCampaignRequestBuilderTest.NewObject().WithLocations().WithCnaes().Build();

        var result = await CampaignCommandService.CreateCampaignAsync(request, BusinessUnitId);

        Assert.False(result);
        Assert.True(Notification.GetNotifications().Count >= 2);
    }

    [Fact]
    [Trait("Create", "References")]
    public async Task CreateCampaignAsync_CnaeNotInReferenceTable_ReturnsFalse()
    {
        var request = CreateCampaignRequestBuilderTest.NewObject().WithCnaes("6201501", "9999999").Build();
        ReferenceRepository
            .Setup(r => r.FindCnaesByCodesAsync(It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync((IReadOnlyList<Cnae>)[new Cnae { Code = "6201501", Description = "ok" }]);

        var result = await CampaignCommandService.CreateCampaignAsync(request, BusinessUnitId);

        Assert.False(result);
        Assert.Contains("9999999", SingleNotificationMessage());
        CampaignRepository.Verify(r => r.SaveAsync(It.IsAny<Campaign>()), Times.Never);
    }

    [Fact]
    [Trait("Create", "References")]
    public async Task CreateCampaignAsync_MunicipalityOfAnotherState_ReturnsFalse()
    {
        var request = CreateCampaignRequestBuilderTest.NewObject().WithLocations(("SP", "6001")).Build();
        ReferenceRepository
            .Setup(r => r.FindMunicipalitiesByCodesAsync(It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync((IReadOnlyList<Municipality>)[new Municipality { Code = "6001", State = "RJ", Name = "RIO" }]);

        var result = await CampaignCommandService.CreateCampaignAsync(request, BusinessUnitId);

        Assert.False(result);
        Assert.Contains("6001", SingleNotificationMessage());
    }

    [Fact]
    [Trait("Create", "Idempotency")]
    public async Task CreateCampaignAsync_SameRequestIdAndSameData_ReturnsTrueWithoutCreatingAnother()
    {
        var request = CreateCampaignRequestBuilderTest.NewObject().Build();
        var existing = CampaignBuilderTest.NewObject().WithRequestId(request.RequestId).Build();
        CampaignRepository.Setup(r => r.FindByRequestIdAsync(request.RequestId, BusinessUnitId)).ReturnsAsync(existing);

        var result = await CampaignCommandService.CreateCampaignAsync(request, BusinessUnitId);

        Assert.True(result);
        CampaignRepository.Verify(r => r.SaveAsync(It.IsAny<Campaign>()), Times.Never);
        Assert.Empty(RecordedEvents);
    }

    [Fact]
    [Trait("Create", "Idempotency")]
    public async Task CreateCampaignAsync_SameRequestIdWithDifferentData_ReturnsFalse()
    {
        var request = CreateCampaignRequestBuilderTest.NewObject().WithName("Outro nome").Build();
        var existing = CampaignBuilderTest.NewObject().WithRequestId(request.RequestId).Build();
        CampaignRepository.Setup(r => r.FindByRequestIdAsync(request.RequestId, BusinessUnitId)).ReturnsAsync(existing);

        var result = await CampaignCommandService.CreateCampaignAsync(request, BusinessUnitId);

        Assert.False(result);
        CampaignRepository.Verify(r => r.SaveAsync(It.IsAny<Campaign>()), Times.Never);
    }

    [Fact]
    [Trait("Create", "Idempotency")]
    public async Task CreateCampaignAsync_ParallelDuplicateHitsUniqueIndex_ReturnsTrueWhenSameData()
    {
        var request = CreateCampaignRequestBuilderTest.NewObject().Build();
        var existing = CampaignBuilderTest.NewObject().WithRequestId(request.RequestId).Build();
        CampaignRepository
            .SetupSequence(r => r.FindByRequestIdAsync(request.RequestId, BusinessUnitId))
            .ReturnsAsync((Campaign?)null)
            .ReturnsAsync(existing);
        CampaignRepository.Setup(r => r.SaveAsync(It.IsAny<Campaign>())).ThrowsAsync(new DbUpdateException("duplicado"));

        var result = await CampaignCommandService.CreateCampaignAsync(request, BusinessUnitId);

        Assert.True(result);
        Assert.Empty(RecordedEvents);
    }

    [Fact]
    [Trait("Create", "Idempotency")]
    public async Task CreateCampaignAsync_DbUpdateExceptionWithoutExistingCampaign_Rethrows()
    {
        var request = CreateCampaignRequestBuilderTest.NewObject().Build();
        CampaignRepository.Setup(r => r.SaveAsync(It.IsAny<Campaign>())).ThrowsAsync(new DbUpdateException("falha"));

        await Assert.ThrowsAsync<DbUpdateException>(() => CampaignCommandService.CreateCampaignAsync(request, BusinessUnitId));
    }

    [Fact]
    [Trait("Create", "Required fields")]
    public async Task CreateCampaignAsync_EmptyRequestId_ReturnsFalse()
    {
        var request = CreateCampaignRequestBuilderTest.NewObject().WithRequestId(Guid.Empty).Build();

        var result = await CampaignCommandService.CreateCampaignAsync(request, BusinessUnitId);

        Assert.False(result);
        CampaignRepository.Verify(r => r.SaveAsync(It.IsAny<Campaign>()), Times.Never);
    }

    [Fact]
    [Trait("Create", "Persistence failure")]
    public async Task CreateCampaignAsync_RepositoryReturnsFalse_ReturnsFalseWithoutEvent()
    {
        var request = CreateCampaignRequestBuilderTest.NewObject().Build();
        CampaignRepository.Setup(r => r.SaveAsync(It.IsAny<Campaign>())).ReturnsAsync(false);

        var result = await CampaignCommandService.CreateCampaignAsync(request, BusinessUnitId);

        Assert.False(result);
        Assert.Empty(RecordedEvents);
    }
}
