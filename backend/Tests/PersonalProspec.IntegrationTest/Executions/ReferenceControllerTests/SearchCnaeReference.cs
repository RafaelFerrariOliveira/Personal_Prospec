using System.Net;
using PersonalProspec.IntegrationTest.Settings;

namespace PersonalProspec.IntegrationTest.Executions.ReferenceControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class SearchCnaeReference(DatabaseFixture fixture) : CampaignIntegrationTestBase(fixture)
{
    private const string Url = "api/Reference/search_cnae_reference";

    [Fact]
    [Trait("e2e", "Search by description ignoring accent and case")]
    public async Task SearchCnaeReference_TermWithoutAccent_FindsAccentedDescription()
    {
        var client = await AdminClientAsync();

        var response = await client.GetAsync($"{Url}?search=INSTITUICOES", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadJsonAsync(response);
        Assert.True(body.GetArrayLength() > 0);
        Assert.Contains(body.EnumerateArray(), i => i.GetProperty("description").GetString()!.Contains("instituições"));
    }

    [Fact]
    [Trait("e2e", "Search by code")]
    public async Task SearchCnaeReference_CodePrefix_FindsByCode()
    {
        var client = await AdminClientAsync();

        var response = await client.GetAsync($"{Url}?search=620150", TestContext.Current.CancellationToken);

        var body = await ReadJsonAsync(response);
        Assert.Contains(body.EnumerateArray(), i => i.GetProperty("code").GetString() == "6201501");
    }

    [Fact]
    [Trait("e2e", "Limit of twenty results")]
    public async Task SearchCnaeReference_BroadTerm_ReturnsAtMostTwentyResults()
    {
        var client = await AdminClientAsync();

        var response = await client.GetAsync($"{Url}?search=de", TestContext.Current.CancellationToken);

        var body = await ReadJsonAsync(response);
        Assert.Equal(20, body.GetArrayLength());
    }

    [Fact]
    [Trait("e2e", "Short term")]
    public async Task SearchCnaeReference_OneCharacter_ReturnsEmptyList()
    {
        var client = await AdminClientAsync();

        var response = await client.GetAsync($"{Url}?search=a", TestContext.Current.CancellationToken);

        var body = await ReadJsonAsync(response);
        Assert.Equal(0, body.GetArrayLength());
    }

    [Fact]
    [Trait("e2e", "Return Status 401 Unauthorized")]
    public async Task SearchCnaeReference_WithoutSession_ReturnsUnauthorized()
    {
        var response = await CreateRawClient().GetAsync($"{Url}?search=software", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Return Status 403 Forbidden")]
    public async Task SearchCnaeReference_RoleWithoutPermission_ReturnsForbidden()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync("Viewer");

        var response = await client.GetAsync($"{Url}?search=software", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
