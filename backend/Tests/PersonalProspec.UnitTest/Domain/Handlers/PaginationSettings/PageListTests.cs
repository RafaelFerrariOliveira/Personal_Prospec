using PersonalProspec.Domain.Handlers.PaginationSettings;

namespace PersonalProspec.UnitTest.Domain.Handlers.PaginationSettings;

public sealed class PageListTests
{
    [Fact]
    [Trait("Pagination", "Empty")]
    public void PageList_ParameterlessConstructor_ReturnsEmptyItems()
    {
        var pageList = new PageList<string>();

        Assert.Empty(pageList.Items);
        Assert.Equal(0, pageList.TotalPages);
    }

    [Theory]
    [Trait("Pagination", "Total pages")]
    [InlineData(0, 10, 0)]
    [InlineData(10, 10, 1)]
    [InlineData(11, 10, 2)]
    [InlineData(25, 30, 1)]
    public void PageList_TotalCountAndPageSize_CalculatesTotalPages(int totalCount, int pageSize, int expected)
    {
        var pageList = new PageList<string>([], totalCount, 1, pageSize);

        Assert.Equal(expected, pageList.TotalPages);
    }

    [Fact]
    [Trait("Pagination", "Invalid page size")]
    public void PageList_PageSizeZero_ReturnsZeroTotalPages()
    {
        var pageList = new PageList<string>([], 10, 1, 0);

        Assert.Equal(0, pageList.TotalPages);
    }
}
