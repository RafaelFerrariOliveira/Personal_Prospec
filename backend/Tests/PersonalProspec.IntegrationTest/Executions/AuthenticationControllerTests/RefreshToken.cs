using System.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NodaTime;
using PersonalProspec.Api.Handlers;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.Domain.Entities;
using PersonalProspec.IntegrationTest.Settings;
using RefreshTokenEntity = PersonalProspec.Domain.Entities.Identity.RefreshToken;

namespace PersonalProspec.IntegrationTest.Executions.AuthenticationControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class RefreshToken(DatabaseFixture fixture) : IntegrationTestBase(fixture)
{
    private const string Url = "api/Authentication/refresh_token";

    private Task<List<RefreshTokenEntity>> LoadRefreshTokensAsync() =>
        WithDbAsync(c => c.Set<RefreshTokenEntity>().IgnoreQueryFilters().AsNoTracking()
            .ToListAsync(TestContext.Current.CancellationToken));

    // Cliente novo (sem jar compartilhado) que apresenta o refresh cru explicitamente.
    private static Task<HttpResponseMessage> PostWithRefreshCookieAsync(HttpClient client, string refreshRaw)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, Url);
        request.Headers.Add("Cookie", $"{AuthCookieHandler.RefreshCookieName}={refreshRaw}");
        return client.SendAsync(request, TestContext.Current.CancellationToken);
    }

    [Fact]
    [Trait("e2e", "Perfect setting: rotation")]
    public async Task RefreshToken_ValidRefresh_RotatesAndRevokesExactlyTheOldOne()
    {
        var client = CreateRawClient();
        var login = await LoginAsync(client);
        var oldRaw = GetSetCookieValue(login, AuthCookieHandler.RefreshCookieName);

        var response = await client.PostAsync(Url, null, TestContext.Current.CancellationToken);

        var newRaw = GetSetCookieValue(response, AuthCookieHandler.RefreshCookieName);
        var tokens = await LoadRefreshTokensAsync();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(string.IsNullOrEmpty(newRaw));
        Assert.NotEqual(oldRaw, newRaw);
        Assert.NotNull(GetSetCookieValue(response, AuthCookieHandler.AccessCookieName));
        Assert.Equal(2, tokens.Count);
        Assert.Single(tokens, t => t.RevokedAt is not null);
        Assert.Single(tokens, t => t.RevokedAt is null);
    }

    [Fact]
    [Trait("e2e", "Security: reuse of revoked refresh")]
    public async Task RefreshToken_RevokedRefreshReused_IsRefusedAndRevokesAllOthers()
    {
        var client = CreateRawClient();
        var login = await LoginAsync(client);
        var oldRaw = GetSetCookieValue(login, AuthCookieHandler.RefreshCookieName)!;
        await client.PostAsync(Url, null, TestContext.Current.CancellationToken);

        var attacker = CreateRawClient();
        var response = await PostWithRefreshCookieAsync(attacker, oldRaw);

        var tokens = await LoadRefreshTokensAsync();
        var events = await WithDbAsync(c => c.Set<Event>().IgnoreQueryFilters().AsNoTracking()
            .ToListAsync(TestContext.Current.CancellationToken));
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True(string.IsNullOrEmpty(GetSetCookieValue(response, AuthCookieHandler.AccessCookieName)));
        Assert.Equal(2, tokens.Count);
        Assert.All(tokens, t => Assert.NotNull(t.RevokedAt));
        Assert.Contains(events, e => e.Type == "RefreshReuseDetected");
    }

    [Fact]
    [Trait("e2e", "Unknown refresh")]
    public async Task RefreshToken_UnknownRefresh_IsRefused()
    {
        var client = CreateRawClient();

        var response = await PostWithRefreshCookieAsync(client, "refresh-inexistente-ficticio");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Empty(await LoadRefreshTokensAsync());
    }

    [Fact]
    [Trait("e2e", "No cookie")]
    public async Task RefreshToken_NoCookie_IsRefusedWithoutCsrf()
    {
        var client = CreateRawClient();

        var response = await client.PostAsync(Url, null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Expired refresh")]
    public async Task RefreshToken_ExpiredRefresh_IsRefusedWithoutRotation()
    {
        var raw = "refresh-expirado-ficticio";
        await InsertRefreshAsync(raw, PersonalProspec.IntegrationTest.Settings.Seeds.SystemSeedIdTools.BusinessUnitId,
            expiresAt: SystemClock.Instance.GetCurrentInstant().Minus(Duration.FromMinutes(1)));
        var client = CreateRawClient();

        var response = await PostWithRefreshCookieAsync(client, raw);

        var stored = Assert.Single(await LoadRefreshTokensAsync());
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Null(stored.RevokedAt);
    }

    [Fact]
    [Trait("e2e", "Security: other business unit")]
    public async Task RefreshToken_RefreshOfAnotherBusinessUnit_IsUnusable()
    {
        var raw = "refresh-de-outra-unidade-ficticio";
        await InsertRefreshAsync(raw, Guid.NewGuid());
        var client = CreateRawClient();

        var response = await PostWithRefreshCookieAsync(client, raw);

        var stored = Assert.Single(await LoadRefreshTokensAsync());
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True(string.IsNullOrEmpty(GetSetCookieValue(response, AuthCookieHandler.AccessCookieName)));
        Assert.Null(stored.RevokedAt);
    }

    private async Task InsertRefreshAsync(string raw, Guid businessUnitId, Instant? expiresAt = null)
    {
        var userId = await GetSeedUserIdAsync();
        using var scope = Fixture.Factory.Services.CreateScope();
        var hash = scope.ServiceProvider.GetRequiredService<IJwtTokenService>().HashToken(raw);
        var context = scope.ServiceProvider.GetRequiredService<PersonalProspec.Infra.ORM.Contexts.ApplicationContext>();
        var now = SystemClock.Instance.GetCurrentInstant();

        context.Set<RefreshTokenEntity>().Add(new RefreshTokenEntity
        {
            UserId = userId,
            TokenHash = hash,
            ExpiresAt = expiresAt ?? now.Plus(Duration.FromMinutes(30)),
            CreatedAt = now,
            BusinessUnitId = businessUnitId
        });

        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
    }
}
