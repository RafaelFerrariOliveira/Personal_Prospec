using NodaTime;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.Domain.Providers;

namespace PersonalProspec.Api.Handlers;

// Access e refresh token SÓ em cookie HttpOnly, Secure e SameSite=Strict. O cookie de refresh tem Path
// restrito ao endpoint de refresh, para não viajar em toda requisição.
public sealed class AuthCookieHandler(
    IHttpContextAccessor httpContextAccessor,
    JwtTokenOptions options,
    IClock clock) : IAuthCookieHandler
{
    public const string AccessCookieName = "pp_access";
    public const string RefreshCookieName = "pp_refresh";
    public const string RefreshCookiePath = "/api/Authentication/refresh_token";

    private HttpContext Context =>
        httpContextAccessor.HttpContext ?? throw new InvalidOperationException("Sem HttpContext na requisição.");

    public void SetSession(string accessToken, string refreshToken)
    {
        var now = clock.GetCurrentInstant();

        Context.Response.Cookies.Append(AccessCookieName, accessToken,
            BuildOptions("/", now.Plus(Duration.FromMinutes(options.AccessTokenMinutes))));

        Context.Response.Cookies.Append(RefreshCookieName, refreshToken,
            BuildOptions(RefreshCookiePath, now.Plus(Duration.FromMinutes(options.RefreshTokenMinutes))));
    }

    public void ClearSession()
    {
        Context.Response.Cookies.Delete(AccessCookieName, BuildOptions("/", null));
        Context.Response.Cookies.Delete(RefreshCookieName, BuildOptions(RefreshCookiePath, null));
    }

    public string? GetRefreshToken() =>
        Context.Request.Cookies.TryGetValue(RefreshCookieName, out var value) && !string.IsNullOrWhiteSpace(value)
            ? value
            : null;

    private static CookieOptions BuildOptions(string path, Instant? expires) =>
        new()
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = path,
            Expires = expires?.ToDateTimeOffset(),
            IsEssential = true
        };
}
