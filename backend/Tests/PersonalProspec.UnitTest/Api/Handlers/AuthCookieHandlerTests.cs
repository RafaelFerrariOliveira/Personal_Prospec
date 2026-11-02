using Microsoft.AspNetCore.Http;
using Microsoft.Net.Http.Headers;
using Moq;
using NodaTime;
using PersonalProspec.Api.Handlers;
using PersonalProspec.Domain.Providers;

namespace PersonalProspec.UnitTest.Api.Handlers;

public sealed class AuthCookieHandlerTests
{
    private static readonly Instant Now = Instant.FromUtc(2026, 11, 2, 12, 0, 0);

    private readonly DefaultHttpContext _httpContext = new();
    private readonly AuthCookieHandler _handler;

    public AuthCookieHandlerTests()
    {
        var accessor = new Mock<IHttpContextAccessor>();
        accessor.SetupGet(a => a.HttpContext).Returns(_httpContext);

        var clock = new Mock<IClock>();
        clock.Setup(c => c.GetCurrentInstant()).Returns(Now);

        var options = new JwtTokenOptions
        {
            JwtKey = "chave-ficticia-de-teste-com-32-bytes-ou-mais",
            Issuer = "emissor-ficticio",
            Audience = "audiencia-ficticia",
            AccessTokenMinutes = 15,
            RefreshTokenMinutes = 30
        };

        _handler = new AuthCookieHandler(accessor.Object, options, clock.Object);
    }

    private SetCookieHeaderValue Cookie(string name) =>
        SetCookieHeaderValue.ParseList(_httpContext.Response.Headers.SetCookie.ToArray()!)
            .Single(c => c.Name == name);

    [Theory]
    [Trait("Categoria", "Cookies de sessão")]
    [InlineData(AuthCookieHandler.AccessCookieName)]
    [InlineData(AuthCookieHandler.RefreshCookieName)]
    public void SetSession_BothCookies_AreHttpOnlySecureAndSameSiteStrict(string cookieName)
    {
        _handler.SetSession("access-ficticio", "refresh-ficticio");

        var cookie = Cookie(cookieName);
        Assert.True(cookie.HttpOnly);
        Assert.True(cookie.Secure);
        Assert.Equal(Microsoft.Net.Http.Headers.SameSiteMode.Strict, cookie.SameSite);
    }

    [Fact]
    [Trait("Categoria", "Cookies de sessão")]
    public void SetSession_ValidTokens_StoresTokenValuesInCookies()
    {
        _handler.SetSession("access-ficticio", "refresh-ficticio");

        Assert.Equal("access-ficticio", Cookie(AuthCookieHandler.AccessCookieName).Value.Value);
        Assert.Equal("refresh-ficticio", Cookie(AuthCookieHandler.RefreshCookieName).Value.Value);
    }

    [Fact]
    [Trait("Categoria", "Cookies de sessão")]
    public void SetSession_RefreshCookie_HasPathRestrictedToRefreshEndpoint()
    {
        _handler.SetSession("access-ficticio", "refresh-ficticio");

        Assert.Equal(AuthCookieHandler.RefreshCookiePath, Cookie(AuthCookieHandler.RefreshCookieName).Path.Value);
        Assert.Equal("/", Cookie(AuthCookieHandler.AccessCookieName).Path.Value);
    }

    [Fact]
    [Trait("Categoria", "Cookies de sessão")]
    public void SetSession_ValidTokens_ExpiresFollowConfiguredMinutes()
    {
        _handler.SetSession("access-ficticio", "refresh-ficticio");

        Assert.Equal(Now.Plus(Duration.FromMinutes(15)).ToDateTimeOffset(),
            Cookie(AuthCookieHandler.AccessCookieName).Expires);
        Assert.Equal(Now.Plus(Duration.FromMinutes(30)).ToDateTimeOffset(),
            Cookie(AuthCookieHandler.RefreshCookieName).Expires);
    }

    [Theory]
    [Trait("Categoria", "Cookies de sessão")]
    [InlineData(AuthCookieHandler.AccessCookieName, "/")]
    [InlineData(AuthCookieHandler.RefreshCookieName, AuthCookieHandler.RefreshCookiePath)]
    public void ClearSession_Cookies_AreEmptiedAndExpiredOnTheSamePath(string cookieName, string expectedPath)
    {
        _handler.ClearSession();

        var cookie = Cookie(cookieName);
        Assert.True(string.IsNullOrEmpty(cookie.Value.Value));
        Assert.True(cookie.Expires <= DateTimeOffset.UnixEpoch);
        Assert.Equal(expectedPath, cookie.Path.Value);
        Assert.True(cookie.HttpOnly);
        Assert.True(cookie.Secure);
        Assert.Equal(Microsoft.Net.Http.Headers.SameSiteMode.Strict, cookie.SameSite);
    }

    [Fact]
    [Trait("Categoria", "Cookies de sessão")]
    public void GetRefreshToken_CookiePresent_ReturnsValue()
    {
        _httpContext.Request.Headers.Cookie = $"{AuthCookieHandler.RefreshCookieName}=refresh-ficticio";

        Assert.Equal("refresh-ficticio", _handler.GetRefreshToken());
    }

    [Theory]
    [Trait("Categoria", "Cookies de sessão")]
    [InlineData("")]
    [InlineData("outro=valor")]
    [InlineData($"{AuthCookieHandler.RefreshCookieName}=")]
    public void GetRefreshToken_CookieAbsentOrEmpty_ReturnsNull(string cookieHeader)
    {
        _httpContext.Request.Headers.Cookie = cookieHeader;

        Assert.Null(_handler.GetRefreshToken());
    }

    [Fact]
    [Trait("Categoria", "Cookies de sessão")]
    public void SetSession_WithoutHttpContext_ThrowsInvalidOperation()
    {
        var accessor = new Mock<IHttpContextAccessor>();
        accessor.SetupGet(a => a.HttpContext).Returns((HttpContext?)null);
        var handler = new AuthCookieHandler(accessor.Object,
            new JwtTokenOptions { JwtKey = "k", Issuer = "i", Audience = "a" }, Mock.Of<IClock>());

        Assert.Throws<InvalidOperationException>(() => handler.SetSession("a", "r"));
    }
}
