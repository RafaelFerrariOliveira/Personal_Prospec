using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using PersonalProspec.Api.Handlers;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Extensions;
using PersonalProspec.Domain.Handlers.NotificationSettings;
using PersonalProspec.IntegrationTest.Settings;
using PersonalProspec.IntegrationTest.Settings.Seeds;

namespace PersonalProspec.IntegrationTest.Executions.AuthenticationControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class GenerateAccessToken(DatabaseFixture fixture) : IntegrationTestBase(fixture)
{
    private const string Url = "api/Authentication/generate_access_token";
    private const string WrongPassword = "senha-errada-ficticia-0";

    private static Task<HttpResponseMessage> PostLoginAsync(HttpClient client, string email, string password) =>
        client.PostAsJsonAsync(Url, new { email, password }, TestContext.Current.CancellationToken);

    [Fact]
    [Trait("e2e", "Perfect setting: cookies without token in body")]
    public async Task GenerateAccessToken_ValidCredentials_SetsSecureCookiesAndNoTokenInBody()
    {
        var client = CreateRawClient();

        var response = await LoginAsync(client);

        var cookies = ParseSetCookies(response);
        var access = Assert.Single(cookies, c => c.Name == AuthCookieHandler.AccessCookieName);
        var refresh = Assert.Single(cookies, c => c.Name == AuthCookieHandler.RefreshCookieName);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.All([access, refresh], c =>
        {
            Assert.True(c.HttpOnly);
            Assert.True(c.Secure);
            Assert.Equal(Microsoft.Net.Http.Headers.SameSiteMode.Strict, c.SameSite);
        });
        Assert.Equal(AuthCookieHandler.RefreshCookiePath, refresh.Path.Value);
        Assert.DoesNotContain(access.Value.Value!, body);
        Assert.DoesNotContain(refresh.Value.Value!, body);
    }

    [Fact]
    [Trait("e2e", "Anonymous endpoint ignores CSRF")]
    public async Task GenerateAccessToken_AnonymousPostWithoutCsrfToken_Works()
    {
        var client = CreateRawClient();

        var response = await LoginAsync(client);

        Assert.False(client.DefaultRequestHeaders.Contains("X-CSRF-TOKEN"));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Same body for wrong password and unknown email")]
    public async Task GenerateAccessToken_WrongPasswordAndUnknownEmail_ReturnIdenticalBadRequestBody()
    {
        var client = CreateRawClient();

        var wrongPassword = await PostLoginAsync(client, SystemSeedIdTools.TestEmail, WrongPassword);
        var unknownEmail = await PostLoginAsync(client, "inexistente@exemplo.test", WrongPassword);

        var wrongPasswordBody = await wrongPassword.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        var unknownEmailBody = await unknownEmail.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.BadRequest, wrongPassword.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, unknownEmail.StatusCode);
        Assert.Equal(wrongPasswordBody, unknownEmailBody);
        Assert.Contains(EMessage.InvalidCredentials.GetDescription(), wrongPasswordBody);
        Assert.Null(GetSetCookieValue(wrongPassword, AuthCookieHandler.AccessCookieName));
    }

    [Fact]
    [Trait("e2e", "Empty field")]
    public async Task GenerateAccessToken_EmptyPassword_ReturnsSameInvalidCredentialsBody()
    {
        var client = CreateRawClient();

        var response = await PostLoginAsync(client, SystemSeedIdTools.TestEmail, string.Empty);

        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains(EMessage.InvalidCredentials.GetDescription(), body);
    }

    [Fact]
    [Trait("e2e", "Lockout persists (UnitOfWorkFilter deviation)")]
    public async Task GenerateAccessToken_FiveWrongPasswords_LocksAccountAndLockoutPersists()
    {
        var client = CreateRawClient();
        HttpResponseMessage fifth = null!;

        foreach (var _ in Enumerable.Range(1, 5))
            fifth = await PostLoginAsync(client, SystemSeedIdTools.TestEmail, WrongPassword);

        var correctPasswordWhileLocked = await LoginAsync(client);

        var fifthBody = await fifth.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        var lockedBody = await correctPasswordWhileLocked.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        var lockoutEnd = await WithDbAsync(c => c.Set<User>().IgnoreQueryFilters()
            .Select(u => u.LockoutEnd).SingleAsync(TestContext.Current.CancellationToken));
        Assert.Equal(HttpStatusCode.BadRequest, fifth.StatusCode);
        Assert.Contains("Muitas tentativas", fifthBody);
        Assert.Equal(HttpStatusCode.BadRequest, correctPasswordWhileLocked.StatusCode);
        Assert.Contains("Muitas tentativas", lockedBody);
        Assert.NotNull(lockoutEnd);
        Assert.Null(GetSetCookieValue(correctPasswordWhileLocked, AuthCookieHandler.AccessCookieName));
    }

    [Fact]
    [Trait("e2e", "Failure count persists (UnitOfWorkFilter deviation)")]
    public async Task GenerateAccessToken_WrongPasswordThenSuccess_ResetsFailureCount()
    {
        var client = CreateRawClient();
        await PostLoginAsync(client, SystemSeedIdTools.TestEmail, WrongPassword);
        var afterFailure = await WithDbAsync(c => c.Set<User>().IgnoreQueryFilters()
            .Select(u => u.AccessFailedCount).SingleAsync(TestContext.Current.CancellationToken));

        var response = await LoginAsync(client);

        var afterSuccess = await WithDbAsync(c => c.Set<User>().IgnoreQueryFilters()
            .Select(u => u.AccessFailedCount).SingleAsync(TestContext.Current.CancellationToken));
        Assert.Equal(1, afterFailure);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(0, afterSuccess);
    }

    [Fact]
    [Trait("e2e", "Auth event without password")]
    public async Task GenerateAccessToken_FailureAndSuccess_RecordAuthEventsWithoutPassword()
    {
        var client = CreateRawClient();
        await PostLoginAsync(client, SystemSeedIdTools.TestEmail, WrongPassword);
        await LoginAsync(client);

        var events = await WithDbAsync(c => c.Set<Event>().IgnoreQueryFilters().AsNoTracking()
            .ToListAsync(TestContext.Current.CancellationToken));

        Assert.Contains(events, e => e.Type == "LoginFailed" && e.Category == EEventCategory.Auth);
        Assert.Contains(events, e => e.Type == "LoginSucceeded" && e.Category == EEventCategory.Auth);
        Assert.DoesNotContain(events, e => e.Description.Contains(WrongPassword)
            || e.Description.Contains(SystemSeedIdTools.TestPassword)
            || e.Description.Contains(SystemSeedIdTools.TestEmail));
    }

    [Fact]
    [Trait("e2e", "Refresh stored only as hash")]
    public async Task GenerateAccessToken_ValidCredentials_StoresOnlyHashOfRefreshToken()
    {
        var client = CreateRawClient();

        var response = await LoginAsync(client);

        var raw = GetSetCookieValue(response, AuthCookieHandler.RefreshCookieName)!;
        var hashes = await WithDbAsync(c => c.Set<PersonalProspec.Domain.Entities.Identity.RefreshToken>()
            .IgnoreQueryFilters().Select(t => t.TokenHash).ToListAsync(TestContext.Current.CancellationToken));
        var stored = Assert.Single(hashes);
        Assert.NotEqual(raw, stored);
    }
}
