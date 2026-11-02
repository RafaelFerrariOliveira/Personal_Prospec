namespace PersonalProspec.Api.Extensions;

public static class HttpContextExtension
{
    extension(HttpContext context)
    {
        public bool IsMethodGet() => HttpMethods.IsGet(context.Request.Method);
    }
}
