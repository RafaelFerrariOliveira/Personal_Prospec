using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using PersonalProspec.IntegrationTest.Settings;
using PersonalProspec.Domain.UserPolicies;

namespace PersonalProspec.IntegrationTest.Executions.SmokeTests;

[Collection(IntegrationCollection.Name)]
public sealed class InfrastructureSmokeTests(DatabaseFixture fixture) : IntegrationTestBase(fixture)
{
    [Fact]
    [Trait("Categoria", "Infraestrutura de integração")]
    public async Task GetAntiforgeryToken_AnonymousClient_ReturnsOkWithToken()
    {
        var client = CreateRawClient();

        var response = await client.GetAsync("api/Antiforgery/token", TestContext.Current.CancellationToken);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("token").GetString()));
    }

    [Fact]
    [Trait("Categoria", "Infraestrutura de integração")]
    public async Task GetHealth_Anonymous_ReturnsOk()
    {
        var client = CreateRawClient();

        var response = await client.GetAsync("/health", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    [Trait("Categoria", "Infraestrutura de integração")]
    public async Task CreateAuthenticatedClientWithCsrfAsync_Administrator_ReturnsClientWithCsrfHeader()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync(Policy.Administrator);

        Assert.True(client.DefaultRequestHeaders.Contains("X-CSRF-TOKEN"));
        Assert.True(client.DefaultRequestHeaders.Contains(TestAuthHandler.RoleHeader));
    }

    [Fact]
    [Trait("Categoria", "Infraestrutura de integração")]
    public async Task CreateAnonymousClientWithCsrfAsync_NoRole_ReturnsClientWithoutTestHeaders()
    {
        var client = await CreateAnonymousClientWithCsrfAsync();

        Assert.True(client.DefaultRequestHeaders.Contains("X-CSRF-TOKEN"));
        Assert.False(client.DefaultRequestHeaders.Contains(TestAuthHandler.RoleHeader));
    }
}
