using Moq;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Handlers.PaginationSettings;
using PersonalProspec.UnitTest.ApplicationService.Services.ReferenceServices.Base;

namespace PersonalProspec.UnitTest.ApplicationService.Services.ReferenceServices;

public sealed class GetMunicipalitiesAsyncTests : ReferenceQueryServiceSetup
{
    [Fact]
    [Trait("GetMunicipalities", "Perfect setting")]
    public async Task GetMunicipalitiesAsync_ValidState_ReturnsMappedPage()
    {
        var pageParams = new PageParams();
        ReferenceRepository
            .Setup(r => r.GetMunicipalitiesAsync("SP", "sao", pageParams))
            .ReturnsAsync(new PageList<Municipality>([new Municipality { Code = "7107", State = "SP", Name = "SAO PAULO" }], 1, 1, 10));

        var result = await ReferenceQueryService.GetMunicipalitiesAsync("sp", "sao", pageParams);

        var item = Assert.Single(result.Items);
        Assert.Equal("7107", item.Code);
        Assert.Equal("SAO PAULO", item.Name);
    }

    [Theory]
    [InlineData("XX")]
    [InlineData("")]
    [InlineData("São Paulo")]
    [Trait("GetMunicipalities", "Invalid state")]
    public async Task GetMunicipalitiesAsync_InvalidState_ReturnsEmptyPageWithoutQuerying(string state)
    {
        var result = await ReferenceQueryService.GetMunicipalitiesAsync(state, null, new PageParams());

        Assert.Empty(result.Items);
        ReferenceRepository.Verify(
            r => r.GetMunicipalitiesAsync(It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<PageParams>()), Times.Never);
    }
}
