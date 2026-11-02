using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;
using PersonalProspec.Domain.Handlers.PaginationSettings;
using PersonalProspec.UnitTest.Api.Controllers.ReferenceControllerTests.Base;

namespace PersonalProspec.UnitTest.Api.Controllers.ReferenceControllerTests;

public sealed class GetMunicipalitiesReferenceTests : ReferenceControllerSetup
{
    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void GetMunicipalities_Metadata_RequiresAdministratorAndIsGetWithRateLimit()
    {
        AssertEndpoint(nameof(ReferenceController.GetMunicipalities), "get_municipalities_reference");
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task GetMunicipalities_Query_PassesStateSearchAndPaging()
    {
        var pageParams = new PageParams { PageNumber = 2 };
        var page = new PageList<MunicipalityResponse>();
        QueryService.Setup(s => s.GetMunicipalitiesAsync("SP", "sao", pageParams)).ReturnsAsync(page);

        var result = await Controller.GetMunicipalities("SP", "sao", pageParams);

        Assert.Same(page, result);
    }
}
