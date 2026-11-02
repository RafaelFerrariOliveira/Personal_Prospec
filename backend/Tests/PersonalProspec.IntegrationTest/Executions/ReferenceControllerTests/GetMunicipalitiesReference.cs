using System.Net;
using PersonalProspec.IntegrationTest.Settings;

namespace PersonalProspec.IntegrationTest.Executions.ReferenceControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class GetMunicipalitiesReference(DatabaseFixture fixture) : CampaignIntegrationTestBase(fixture)
{
    private const string Url = "api/Reference/get_municipalities_reference";

    [Fact]
    [Trait("e2e", "Perfect setting")]
    public async Task GetMunicipalitiesReference_StateSp_ReturnsPageOfMunicipalitiesOfThatState()
    {
        var client = await AdminClientAsync();

        var response = await client.GetAsync($"{Url}?state=SP&pageSize=30", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadJsonAsync(response);
        Assert.Equal(645, body.GetProperty("totalCount").GetInt32());
        Assert.Equal(30, body.GetProperty("items").GetArrayLength());
    }

    [Fact]
    [Trait("e2e", "Search ignores accent and case")]
    public async Task GetMunicipalitiesReference_SearchWithAccentAndLowercase_FindsUnaccentedUppercaseName()
    {
        var client = await AdminClientAsync();

        var response = await client.GetAsync($"{Url}?state=SP&search=s%C3%A3o%20paulo", TestContext.Current.CancellationToken);

        var body = await ReadJsonAsync(response);
        var names = body.GetProperty("items").EnumerateArray().Select(i => i.GetProperty("name").GetString()).ToList();
        Assert.Contains("SAO PAULO", names);
    }

    [Fact]
    [Trait("e2e", "Invalid state")]
    public async Task GetMunicipalitiesReference_UnknownState_ReturnsEmptyPage()
    {
        var client = await AdminClientAsync();

        var response = await client.GetAsync($"{Url}?state=XX", TestContext.Current.CancellationToken);

        var body = await ReadJsonAsync(response);
        Assert.Empty(body.GetProperty("items").EnumerateArray());
    }

    [Fact]
    [Trait("e2e", "Return Status 401 Unauthorized")]
    public async Task GetMunicipalitiesReference_WithoutSession_ReturnsUnauthorized()
    {
        var response = await CreateRawClient().GetAsync($"{Url}?state=SP", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Return Status 403 Forbidden")]
    public async Task GetMunicipalitiesReference_RoleWithoutPermission_ReturnsForbidden()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync("Viewer");

        var response = await client.GetAsync($"{Url}?state=SP", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
