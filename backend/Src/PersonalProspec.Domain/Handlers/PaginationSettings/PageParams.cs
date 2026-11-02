namespace PersonalProspec.Domain.Handlers.PaginationSettings;

public class PageParams
{
    private const int MaxPageSize = 30;

    public int PageNumber { get; set; } = 1;

    public int PageSize
    {
        get;
        init => field = value > MaxPageSize ? MaxPageSize : value;
    } = 10;
}
