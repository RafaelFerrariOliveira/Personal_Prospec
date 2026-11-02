using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.ApplicationService.Dtos.CampaignDtos.Response;
using PersonalProspec.UnitTest.Api.Controllers.ReferenceControllerTests.Base;

namespace PersonalProspec.UnitTest.Api.Controllers.ReferenceControllerTests;

public sealed class SearchCnaeReferenceTests : ReferenceControllerSetup
{
    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void SearchCnae_Metadata_RequiresAdministratorAndIsGetWithRateLimit()
    {
        AssertEndpoint(nameof(ReferenceController.SearchCnae), "search_cnae_reference");
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public async Task SearchCnae_Term_ReturnsServiceResult()
    {
        IReadOnlyList<CnaeResponse> list = [new CnaeResponse { Code = "6201501", Description = "Software" }];
        QueryService.Setup(s => s.SearchCnaeAsync("soft")).ReturnsAsync(list);

        var result = await Controller.SearchCnae("soft");

        Assert.Same(list, result);
    }
}
