using PersonalProspec.Domain.Handlers.PaginationSettings;

namespace PersonalProspec.UnitTest.Domain.Handlers.PaginationSettings;

public sealed class PageParamsTests
{
    [Fact]
    [Trait("Pagination", "Defaults")]
    public void PageParams_NoValuesInformed_UsesDefaultPageNumberAndSize()
    {
        var pageParams = new PageParams();

        Assert.Equal(1, pageParams.PageNumber);
        Assert.Equal(10, pageParams.PageSize);
    }

    [Theory]
    [Trait("Pagination", "Limit")]
    [InlineData(31, 30)]
    [InlineData(1000, 30)]
    [InlineData(30, 30)]
    [InlineData(5, 5)]
    public void PageSize_InformedValue_IsLimitedToMaxPageSize(int informed, int expected)
    {
        var pageParams = new PageParams { PageSize = informed };

        Assert.Equal(expected, pageParams.PageSize);
    }
}
