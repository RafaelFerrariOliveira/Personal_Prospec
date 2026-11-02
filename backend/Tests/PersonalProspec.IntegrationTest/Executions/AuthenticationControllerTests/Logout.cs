using System.Net;
using Microsoft.EntityFrameworkCore;
using PersonalProspec.Api.Handlers;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.UserPolicies;
using PersonalProspec.IntegrationTest.Settings;
using RefreshTokenEntity = PersonalProspec.Domain.Entities.Identity.RefreshToken;

namespace PersonalProspec.IntegrationTest.Executions.AuthenticationControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class Logout(DatabaseFixture fixture) : IntegrationTestBase(fixture)
{
    private const string Url = "api/Authentication/logout";

    private Task<List<RefreshTokenEntity>> LoadRefreshTokensAsync() =>
        WithDbAsync(c => c.Set<RefreshTokenEntity>().IgnoreQueryFilters().AsNoTracking()
            .ToListAsync(TestContext.Current.CancellationToken));

    // Login real e CSRF buscado DEPOIS do login, como faz o bootstrap de sessão do front.
    private async Task<HttpClient> LoggedClientWithCsrfAsync()
    {
        var client = CreateRawClient();
        await LoginAsync(client);
        await AddCsrfHeaderAsync(client);
        return client;
    }

    [Fact]
    [Trait("e2e", "Perfect setting: cookies cleared")]
    public async Task Logout_RealSessionWithCsrfFetchedAfterLogin_ReturnsOkAndClearsBothCookies()
    {
        var client = await LoggedClientWithCsrfAsync();

        var response = await client.PostAsync(Url, null, TestContext.Current.CancellationToken);

        var cookies = ParseSetCookies(response);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.All(
            [AuthCookieHandler.AccessCookieName, AuthCookieHandler.RefreshCookieName],
            name =>
            {
                var cookie = Assert.Single(cookies, c => c.Name == name);
                Assert.True(string.IsNullOrEmpty(cookie.Value.Value));
                Assert.True(cookie.Expires <= DateTimeOffset.UnixEpoch);
            });
    }

    [Fact]
    [Trait("e2e", "Perfect setting: no active refresh left")]
    public async Task Logout_RealSession_LeavesNoActiveRefreshForTheUser()
    {
        var client = await LoggedClientWithCsrfAsync();
        await LoginAsync(CreateRawClient());

        await client.PostAsync(Url, null, TestContext.Current.CancellationToken);

        var tokens = await LoadRefreshTokensAsync();
        Assert.Equal(2, tokens.Count);
        Assert.All(tokens, t => Assert.NotNull(t.RevokedAt));
    }

    [Fact]
    [Trait("e2e", "Perfect setting: audit event")]
    public async Task Logout_RealSession_RecordsLogoutEvent()
    {
        var client = await LoggedClientWithCsrfAsync();

        await client.PostAsync(Url, null, TestContext.Current.CancellationToken);

        var events = await WithDbAsync(c => c.Set<Event>().IgnoreQueryFilters().AsNoTracking()
            .ToListAsync(TestContext.Current.CancellationToken));
        Assert.Contains(events, e => e.Type == "Logout");
    }

    [Fact]
    [Trait("e2e", "Return Status 401 Unauthorized")]
    public async Task Logout_WithoutSession_ReturnsUnauthorized()
    {
        var client = await CreateAnonymousClientWithCsrfAsync();

        var response = await client.PostAsync(Url, null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Security: authenticated endpoint requires CSRF")]
    public async Task Logout_PostWithoutCsrfToken_IsRefusedAndRevokesNothing()
    {
        var client = CreateRawClient();
        await LoginAsync(client);

        var response = await client.PostAsync(Url, null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Empty(ParseSetCookies(response));
        Assert.All(await LoadRefreshTokensAsync(), t => Assert.Null(t.RevokedAt));
    }

    [Fact]
    [Trait("e2e", "Return Status 403 Forbidden")]
    public async Task Logout_RoleWithoutPermission_ReturnsForbidden()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync("Viewer");

        var response = await client.PostAsync(Url, null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Security: other business unit and user")]
    public async Task Logout_ClaimOfAnotherBusinessUnitAndUser_DoesNotRevokeSeedUserSession()
    {
        await LoginAsync(CreateRawClient());
        var client = await CreateAuthenticatedClientWithCsrfAsync(Policy.Administrator, Guid.NewGuid(), Guid.NewGuid());

        var response = await client.PostAsync(Url, null, TestContext.Current.CancellationToken);

        var stored = Assert.Single(await LoadRefreshTokensAsync());
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(stored.RevokedAt);
    }
}
