using Moq;
using PersonalProspec.Domain.Entities;
using PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices.Base;
using PersonalProspec.UnitTest.Builders;

namespace PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices;

public sealed class GetByIdCampaignAsyncTests : CampaignQueryServiceSetup
{
    [Fact]
    [Trait("GetById", "Perfect setting")]
    public async Task GetByIdCampaignAsync_ExistingCampaign_ReturnsDetailWithNamesAndNoProgress()
    {
        var campaign = CampaignBuilderTest.NewObject().WithBusinessUnitId(BusinessUnitId).Build();
        CampaignRepository.Setup(r => r.FindByIdAsync(campaign.Id, BusinessUnitId, true)).ReturnsAsync(campaign);
        ReferenceRepository
            .Setup(r => r.FindMunicipalitiesByCodesAsync(It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync((IReadOnlyList<Municipality>)[new Municipality { Code = "7107", State = "SP", Name = "SAO PAULO" }]);
        ReferenceRepository
            .Setup(r => r.FindCnaesByCodesAsync(It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync((IReadOnlyList<Cnae>)[new Cnae { Code = "6201501", Description = "Desenvolvimento" }]);

        var result = await CampaignQueryService.GetByIdCampaignAsync(campaign.Id, BusinessUnitId);

        Assert.NotNull(result);
        Assert.Equal(campaign.Id, result.Id);
        Assert.Equal("SAO PAULO", Assert.Single(result.Locations).MunicipalityName);
        Assert.Equal("Desenvolvimento", Assert.Single(result.Cnaes).Description);
        Assert.Null(result.Progress);
    }

    [Fact]
    [Trait("GetById", "Not found")]
    public async Task GetByIdCampaignAsync_UnknownCampaign_ReturnsNull()
    {
        CampaignRepository
            .Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), BusinessUnitId, true))
            .ReturnsAsync((Campaign?)null);

        var result = await CampaignQueryService.GetByIdCampaignAsync(Guid.NewGuid(), BusinessUnitId);

        Assert.Null(result);
        ReferenceRepository.Verify(r => r.FindCnaesByCodesAsync(It.IsAny<IReadOnlyCollection<string>>()), Times.Never);
    }

    [Fact]
    [Trait("GetById", "Security: other tenant")]
    public async Task GetByIdCampaignAsync_CampaignOfAnotherBusinessUnit_ReturnsNullLikeUnknown()
    {
        var campaign = CampaignBuilderTest.NewObject().Build();
        CampaignRepository
            .Setup(r => r.FindByIdAsync(campaign.Id, BusinessUnitId, true))
            .ReturnsAsync((Campaign?)null);

        var result = await CampaignQueryService.GetByIdCampaignAsync(campaign.Id, BusinessUnitId);

        Assert.Null(result);
    }

    [Fact]
    [Trait("GetById", "Missing reference")]
    public async Task GetByIdCampaignAsync_ReferenceNameMissing_FallsBackToCode()
    {
        var campaign = CampaignBuilderTest.NewObject().WithBusinessUnitId(BusinessUnitId).Build();
        CampaignRepository.Setup(r => r.FindByIdAsync(campaign.Id, BusinessUnitId, true)).ReturnsAsync(campaign);
        ReferenceRepository
            .Setup(r => r.FindMunicipalitiesByCodesAsync(It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync((IReadOnlyList<Municipality>)[]);
        ReferenceRepository
            .Setup(r => r.FindCnaesByCodesAsync(It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync((IReadOnlyList<Cnae>)[]);

        var result = await CampaignQueryService.GetByIdCampaignAsync(campaign.Id, BusinessUnitId);

        Assert.Equal("7107", result!.Locations[0].MunicipalityName);
        Assert.Equal("6201501", result.Cnaes[0].Description);
    }
}
