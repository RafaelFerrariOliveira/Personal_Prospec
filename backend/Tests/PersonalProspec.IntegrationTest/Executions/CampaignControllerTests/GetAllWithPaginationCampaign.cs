using System.Net;
using PersonalProspec.Domain.Enums;
using PersonalProspec.IntegrationTest.Settings;

namespace PersonalProspec.IntegrationTest.Executions.CampaignControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class GetAllWithPaginationCampaign(DatabaseFixture fixture) : CampaignIntegrationTestBase(fixture)
{
    private const string Url = $"{CampaignUrl}/get_all_with_pagination_campaign";

    [Fact]
    [Trait("e2e", "Perfect setting: most recent first")]
    public async Task GetAllWithPaginationCampaign_Campaigns_ReturnsMostRecentFirstWithPaginationShape()
    {
        await SeedCampaignAsync(name: "Primeira");
        await Task.Delay(20, TestContext.Current.CancellationToken);
        await SeedCampaignAsync(name: "Segunda");
        var client = await AdminClientAsync();

        var response = await client.GetAsync($"{Url}?pageNumber=1&pageSize=10", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadJsonAsync(response);
        Assert.Equal(2, body.GetProperty("totalCount").GetInt32());
        Assert.Equal(1, body.GetProperty("pageNumber").GetInt32());
        Assert.Equal(10, body.GetProperty("pageSize").GetInt32());
        Assert.Equal(1, body.GetProperty("totalPages").GetInt32());
        var names = body.GetProperty("items").EnumerateArray().Select(i => i.GetProperty("name").GetString()).ToList();
        Assert.Equal(["Segunda", "Primeira"], names);
    }

    [Fact]
    [Trait("e2e", "Filter by status")]
    public async Task GetAllWithPaginationCampaign_StatusFilter_ReturnsOnlyThatStatus()
    {
        await SeedCampaignAsync(name: "Rascunho");
        await SeedCampaignAsync(status: ECampaignStatus.Paused, name: "Pausada");
        var client = await AdminClientAsync();

        var response = await client.GetAsync($"{Url}?status=Paused", TestContext.Current.CancellationToken);

        var body = await ReadJsonAsync(response);
        var item = Assert.Single(body.GetProperty("items").EnumerateArray());
        Assert.Equal("Pausada", item.GetProperty("name").GetString());
        Assert.Equal("SP, 1 cidade", item.GetProperty("locationSummary").GetString());
    }

    [Fact]
    [Trait("e2e", "Pagination")]
    public async Task GetAllWithPaginationCampaign_SecondPage_ReturnsRemainingItems()
    {
        for (var i = 1; i <= 3; i++)
            await SeedCampaignAsync(name: $"Campanha {i}");

        var client = await AdminClientAsync();

        var response = await client.GetAsync($"{Url}?pageNumber=2&pageSize=2", TestContext.Current.CancellationToken);

        var body = await ReadJsonAsync(response);
        Assert.Equal(3, body.GetProperty("totalCount").GetInt32());
        Assert.Equal(2, body.GetProperty("totalPages").GetInt32());
        Assert.Single(body.GetProperty("items").EnumerateArray());
    }

    [Fact]
    [Trait("e2e", "Security: other tenant must not leak data")]
    public async Task GetAllWithPaginationCampaign_CampaignsFromOtherBusinessUnit_AreNeverReturned()
    {
        await SeedCampaignAsync(name: "Minha");
        await SeedCampaignAsync(Guid.NewGuid(), name: "De outra unidade");
        var client = await AdminClientAsync();

        var response = await client.GetAsync(Url, TestContext.Current.CancellationToken);

        var body = await ReadJsonAsync(response);
        var item = Assert.Single(body.GetProperty("items").EnumerateArray());
        Assert.Equal("Minha", item.GetProperty("name").GetString());
        Assert.Equal(1, body.GetProperty("totalCount").GetInt32());
    }

    [Fact]
    [Trait("e2e", "Empty list")]
    public async Task GetAllWithPaginationCampaign_NoCampaigns_ReturnsEmptyPage()
    {
        var client = await AdminClientAsync();

        var response = await client.GetAsync(Url, TestContext.Current.CancellationToken);

        var body = await ReadJsonAsync(response);
        Assert.Equal(0, body.GetProperty("totalCount").GetInt32());
        Assert.Empty(body.GetProperty("items").EnumerateArray());
    }

    [Fact]
    [Trait("e2e", "Return Status 401 Unauthorized")]
    public async Task GetAllWithPaginationCampaign_WithoutSession_ReturnsUnauthorized()
    {
        var response = await CreateRawClient().GetAsync(Url, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Return Status 403 Forbidden")]
    public async Task GetAllWithPaginationCampaign_RoleWithoutPermission_ReturnsForbidden()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync("Viewer");

        var response = await client.GetAsync(Url, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
