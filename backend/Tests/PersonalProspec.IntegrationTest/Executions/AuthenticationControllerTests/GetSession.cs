using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using PersonalProspec.Domain.UserPolicies;
using PersonalProspec.IntegrationTest.Settings;
using PersonalProspec.IntegrationTest.Settings.Seeds;

namespace PersonalProspec.IntegrationTest.Executions.AuthenticationControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class GetSession(DatabaseFixture fixture) : IntegrationTestBase(fixture)
{
    private const string Url = "api/Authentication/get_session";

    [Fact]
    [Trait("e2e", "Perfect setting")]
    public async Task GetSession_RealSession_ReturnsOkWithEmail()
    {
        var client = CreateRawClient();
        await LoginAsync(client);

        var response = await client.GetAsync(Url, TestContext.Current.CancellationToken);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(SystemSeedIdTools.TestEmail, body.GetProperty("email").GetString());
    }

    [Fact]
    [Trait("e2e", "Return Status 401 Unauthorized")]
    public async Task GetSession_WithoutCookie_ReturnsUnauthorized()
    {
        var client = CreateRawClient();

        var response = await client.GetAsync(Url, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Return Status 403 Forbidden")]
    public async Task GetSession_RoleWithoutPermission_ReturnsForbidden()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync("Viewer");

        var response = await client.GetAsync(Url, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Security: other tenant must not leak data")]
    public async Task GetSession_UserOfAnotherBusinessUnit_ReturnsNullWithoutEmail()
    {
        var userId = await GetSeedUserIdAsync();
        var client = await CreateAuthenticatedClientWithCsrfAsync(Policy.Administrator, userId, Guid.NewGuid());

        var response = await client.GetAsync(Url, TestContext.Current.CancellationToken);

        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("null", body.Trim());
        Assert.DoesNotContain(SystemSeedIdTools.TestEmail, body);
    }

    [Fact]
    [Trait("e2e", "Unknown user")]
    public async Task GetSession_UnknownUserSameBusinessUnit_ReturnsSameNullAsOtherTenant()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync(Policy.Administrator, Guid.NewGuid());

        var response = await client.GetAsync(Url, TestContext.Current.CancellationToken);

        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("null", body.Trim());
    }
}
