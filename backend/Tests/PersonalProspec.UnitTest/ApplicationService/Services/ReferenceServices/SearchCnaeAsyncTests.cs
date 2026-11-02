using Moq;
using PersonalProspec.Domain.Entities;
using PersonalProspec.UnitTest.ApplicationService.Services.ReferenceServices.Base;

namespace PersonalProspec.UnitTest.ApplicationService.Services.ReferenceServices;

public sealed class SearchCnaeAsyncTests : ReferenceQueryServiceSetup
{
    [Fact]
    [Trait("SearchCnae", "Perfect setting")]
    public async Task SearchCnaeAsync_ValidTerm_ReturnsMappedListWithLimitOfTwenty()
    {
        ReferenceRepository
            .Setup(r => r.SearchCnaeAsync("software", 20))
            .ReturnsAsync((IReadOnlyList<Cnae>)[new Cnae { Code = "6201501", Description = "Desenvolvimento de software" }]);

        var result = await ReferenceQueryService.SearchCnaeAsync("software");

        var item = Assert.Single(result);
        Assert.Equal("6201501", item.Code);
        ReferenceRepository.Verify(r => r.SearchCnaeAsync("software", 20), Times.Once);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" a ")]
    [Trait("SearchCnae", "Short term")]
    public async Task SearchCnaeAsync_TermShorterThanTwoCharacters_ReturnsEmptyWithoutQuerying(string? search)
    {
        var result = await ReferenceQueryService.SearchCnaeAsync(search);

        Assert.Empty(result);
        ReferenceRepository.Verify(r => r.SearchCnaeAsync(It.IsAny<string>(), It.IsAny<int>()), Times.Never);
    }
}
