using System.Net;
using System.Net.Http.Json;
using PersonalProspec.Domain.Enums;
using PersonalProspec.IntegrationTest.Settings;

namespace PersonalProspec.IntegrationTest.Executions.CampaignControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class GetHistoryCampaign(DatabaseFixture fixture) : CampaignIntegrationTestBase(fixture)
{
    private const string Url = $"{CampaignUrl}/get_history_campaign";

    [Fact]
    [Trait("e2e", "Perfect setting: full cycle history")]
    public async Task GetHistoryCampaign_AfterFullCycle_ListsEveryChangeMostRecentFirst()
    {
        var client = await AdminClientAsync();
        var requestId = Guid.NewGuid();
        await client.PostAsJsonAsync($"{CampaignUrl}/create_campaign", await BuildCampaignPayloadAsync(requestId), TestContext.Current.CancellationToken);
        var id = Assert.Single(await LoadAllCampaignsAsync()).Id;

        await client.PostAsJsonAsync($"{CampaignUrl}/start_campaign", new { Id = id }, TestContext.Current.CancellationToken);
        await client.PostAsJsonAsync($"{CampaignUrl}/pause_campaign", new { Id = id }, TestContext.Current.CancellationToken);
        await client.PutAsJsonAsync(
            $"{CampaignUrl}/update_campaign", await BuildCampaignPayloadAsync(id: id, name: "Nome alterado"), TestContext.Current.CancellationToken);
        await client.PostAsJsonAsync($"{CampaignUrl}/resume_campaign", new { Id = id }, TestContext.Current.CancellationToken);
        await client.PostAsJsonAsync($"{CampaignUrl}/cancel_campaign", new { Id = id }, TestContext.Current.CancellationToken);

        var response = await client.GetAsync($"{Url}?id={id}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadJsonAsync(response);
        var types = body.GetProperty("items").EnumerateArray().Select(i => i.GetProperty("type").GetString()).ToList();
        Assert.Equal(
            ["CampaignCancelled", "CampaignResumed", "CampaignUpdated", "CampaignPaused", "CampaignStarted", "CampaignCreated"],
            types);
        Assert.All(body.GetProperty("items").EnumerateArray(),
            i => Assert.False(string.IsNullOrWhiteSpace(i.GetProperty("occurredAt").GetString())));
    }

    [Fact]
    [Trait("e2e", "Security: other tenant must not leak data")]
    public async Task GetHistoryCampaign_CampaignOfAnotherBusinessUnit_ReturnsEmptyPage()
    {
        var other = await SeedCampaignAsync(Guid.NewGuid());
        var otherClient = await AdminClientAsync(Guid.NewGuid());
        await otherClient.PostAsJsonAsync($"{CampaignUrl}/start_campaign", new { other.Id }, TestContext.Current.CancellationToken);
        var client = await AdminClientAsync();

        var response = await client.GetAsync($"{Url}?id={other.Id}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadJsonAsync(response);
        Assert.Equal(0, body.GetProperty("totalCount").GetInt32());
        Assert.Empty(body.GetProperty("items").EnumerateArray());
    }

    [Fact]
    [Trait("e2e", "Unknown campaign")]
    public async Task GetHistoryCampaign_UnknownCampaign_ReturnsEmptyPage()
    {
        var client = await AdminClientAsync();

        var response = await client.GetAsync($"{Url}?id={Guid.NewGuid()}", TestContext.Current.CancellationToken);

        var body = await ReadJsonAsync(response);
        Assert.Empty(body.GetProperty("items").EnumerateArray());
    }

    [Fact]
    [Trait("e2e", "Return Status 401 Unauthorized")]
    public async Task GetHistoryCampaign_WithoutSession_ReturnsUnauthorized()
    {
        var response = await CreateRawClient().GetAsync($"{Url}?id={Guid.NewGuid()}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Return Status 403 Forbidden")]
    public async Task GetHistoryCampaign_RoleWithoutPermission_ReturnsForbidden()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync("Viewer");

        var response = await client.GetAsync($"{Url}?id={Guid.NewGuid()}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Event of another category is not listed")]
    public async Task GetHistoryCampaign_CampaignSeededWithoutEvents_ReturnsEmptyPage()
    {
        var campaign = await SeedCampaignAsync(status: ECampaignStatus.Draft);
        var client = await AdminClientAsync();

        var response = await client.GetAsync($"{Url}?id={campaign.Id}", TestContext.Current.CancellationToken);

        var body = await ReadJsonAsync(response);
        Assert.Empty(body.GetProperty("items").EnumerateArray());
    }
}
