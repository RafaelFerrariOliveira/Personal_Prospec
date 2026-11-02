using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using PersonalProspec.IntegrationTest.Settings;

namespace PersonalProspec.IntegrationTest.Executions.AntiforgeryControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class GetToken(DatabaseFixture fixture) : IntegrationTestBase(fixture)
{
    private const string Url = "api/Antiforgery/token";

    [Fact]
    [Trait("e2e", "Perfect setting")]
    public async Task GetToken_AnonymousClient_ReturnsOkWithTokenAndAntiforgeryCookie()
    {
        var client = CreateRawClient();

        var response = await client.GetAsync(Url, TestContext.Current.CancellationToken);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions, TestContext.Current.CancellationToken);
        var cookie = Assert.Single(ParseSetCookies(response));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("token").GetString()));
        Assert.True(cookie.HttpOnly);
        Assert.True(cookie.Secure);
        Assert.Equal(Microsoft.Net.Http.Headers.SameSiteMode.Strict, cookie.SameSite);
    }

    [Fact]
    [Trait("e2e", "Token usable on write")]
    public async Task GetToken_TokenFromSameClient_IsAcceptedByCsrfValidationOnAuthenticatedWrite()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync("Viewer");

        var response = await client.PostAsync("api/Authentication/logout", null, TestContext.Current.CancellationToken);

        // 403 (e não 400) prova que o CSRF passou e a autorização por role recusou depois.
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Token fetched after login")]
    public async Task GetToken_TokenFetchedAfterLogin_IsAcceptedOnAuthenticatedWrite()
    {
        var client = CreateRawClient();
        await LoginAsync(client);
        await AddCsrfHeaderAsync(client);

        var response = await client.PostAsync("api/Authentication/logout", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Token fetched before login")]
    public async Task GetToken_TokenFetchedBeforeLogin_IsStillAcceptedAfterLogin()
    {
        var client = CreateRawClient();
        await AddCsrfHeaderAsync(client);
        await LoginAsync(client);

        var response = await client.PostAsync("api/Authentication/logout", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Token not accepted without cookie")]
    public async Task GetToken_TokenSentByClientWithoutAntiforgeryCookie_IsRefusedOnAuthenticatedWrite()
    {
        var withToken = await CreateAuthenticatedClientWithCsrfAsync("Viewer");
        var token = withToken.DefaultRequestHeaders.GetValues("X-CSRF-TOKEN").Single();
        var otherClient = CreateRawClient();
        otherClient.DefaultRequestHeaders.Add("X-CSRF-TOKEN", token);
        otherClient.DefaultRequestHeaders.Add(TestAuthHandler.RoleHeader, "Viewer");

        var response = await otherClient.PostAsync("api/Authentication/logout", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
