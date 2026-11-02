using System.Net;
using System.Text.Json;
using PersonalProspec.IntegrationTest.Settings;

namespace PersonalProspec.IntegrationTest.Executions.CampaignControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class GetByIdCampaign(DatabaseFixture fixture) : CampaignIntegrationTestBase(fixture)
{
    private const string Url = $"{CampaignUrl}/get_by_id_campaign";

    [Fact]
    [Trait("e2e", "Perfect setting")]
    public async Task GetByIdCampaign_ExistingCampaign_ReturnsDetailWithNamesAndNoProgress()
    {
        var campaign = await SeedCampaignAsync(name: "Detalhe");
        var client = await AdminClientAsync();

        var response = await client.GetAsync($"{Url}?id={campaign.Id}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadJsonAsync(response);
        Assert.Equal("Detalhe", body.GetProperty("name").GetString());
        Assert.Equal("draft", body.GetProperty("status").GetString(), ignoreCase: true);
        Assert.Equal(JsonValueKind.Null, body.GetProperty("progress").ValueKind);
        var location = Assert.Single(body.GetProperty("locations").EnumerateArray());
        Assert.Equal("SP", location.GetProperty("state").GetString());
        Assert.False(string.IsNullOrWhiteSpace(location.GetProperty("municipalityName").GetString()));
        var cnae = Assert.Single(body.GetProperty("cnaes").EnumerateArray());
        Assert.False(string.IsNullOrWhiteSpace(cnae.GetProperty("description").GetString()));
    }

    [Fact]
    [Trait("e2e", "Security: other tenant must not leak data")]
    public async Task GetByIdCampaign_CampaignOfAnotherBusinessUnit_ReturnsSameNullAsUnknown()
    {
        var other = await SeedCampaignAsync(Guid.NewGuid());
        var client = await AdminClientAsync();

        var otherResponse = await client.GetAsync($"{Url}?id={other.Id}", TestContext.Current.CancellationToken);
        var unknownResponse = await client.GetAsync($"{Url}?id={Guid.NewGuid()}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, otherResponse.StatusCode);
        Assert.Equal("null", (await otherResponse.Content.ReadAsStringAsync(TestContext.Current.CancellationToken)).Trim());
        Assert.Equal(HttpStatusCode.OK, unknownResponse.StatusCode);
        Assert.Equal("null", (await unknownResponse.Content.ReadAsStringAsync(TestContext.Current.CancellationToken)).Trim());
    }

    [Fact]
    [Trait("e2e", "Return Status 401 Unauthorized")]
    public async Task GetByIdCampaign_WithoutSession_ReturnsUnauthorized()
    {
        var client = CreateRawClient();

        var response = await client.GetAsync($"{Url}?id={Guid.NewGuid()}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Return Status 403 Forbidden")]
    public async Task GetByIdCampaign_RoleWithoutPermission_ReturnsForbidden()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync("Viewer");

        var response = await client.GetAsync($"{Url}?id={Guid.NewGuid()}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
