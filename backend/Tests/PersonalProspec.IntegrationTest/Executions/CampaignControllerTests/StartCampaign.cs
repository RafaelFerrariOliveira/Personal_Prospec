using System.Net;
using System.Net.Http.Json;
using PersonalProspec.Domain.Enums;
using PersonalProspec.IntegrationTest.Settings;

namespace PersonalProspec.IntegrationTest.Executions.CampaignControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class StartCampaign(DatabaseFixture fixture) : CampaignIntegrationTestBase(fixture)
{
    private const string Url = $"{CampaignUrl}/start_campaign";

    [Fact]
    [Trait("e2e", "Perfect setting")]
    public async Task StartCampaign_DraftCampaign_BecomesRunningAndRecordsEvent()
    {
        var campaign = await SeedCampaignAsync();
        var client = await AdminClientAsync();

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ECampaignStatus.Running, (await FindCampaignAsync(campaign.Id))!.Status);
        Assert.Contains(await LoadCampaignEventsAsync(campaign.Id), e => e.Type == "CampaignStarted");
    }

    [Fact]
    [Trait("e2e", "Concurrency: double click")]
    public async Task StartCampaign_TwiceInParallel_StartsOnlyOnce()
    {
        var campaign = await SeedCampaignAsync();
        var client = await AdminClientAsync();

        var responses = await Task.WhenAll(
            client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken),
            client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken));

        Assert.Single(responses, r => r.StatusCode == HttpStatusCode.OK);
        Assert.Single(responses, r => r.StatusCode is HttpStatusCode.BadRequest or HttpStatusCode.Conflict);
        var events = await LoadCampaignEventsAsync(campaign.Id);
        Assert.Single(events, e => e.Type == "CampaignStarted");
    }

    [Fact]
    [Trait("e2e", "Return Status 400 Bad Request: invalid transition")]
    public async Task StartCampaign_CancelledCampaign_ReturnsBadRequestAndKeepsStatus()
    {
        var campaign = await SeedCampaignAsync(status: ECampaignStatus.Cancelled);
        var client = await AdminClientAsync();

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ECampaignStatus.Cancelled, (await FindCampaignAsync(campaign.Id))!.Status);
    }

    [Fact]
    [Trait("e2e", "Security: other tenant must not be changed")]
    public async Task StartCampaign_CampaignOfAnotherBusinessUnit_RespondsAsNotFoundAndKeepsStatus()
    {
        var campaign = await SeedCampaignAsync(Guid.NewGuid());
        var client = await AdminClientAsync();

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ECampaignStatus.Draft, (await FindCampaignAsync(campaign.Id))!.Status);
    }

    [Fact]
    [Trait("e2e", "Return Status 401 Unauthorized")]
    public async Task StartCampaign_WithoutSession_ReturnsUnauthorized()
    {
        var client = await CreateAnonymousClientWithCsrfAsync();

        var response = await client.PostAsJsonAsync(Url, new { Id = Guid.NewGuid() }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Return Status 403 Forbidden")]
    public async Task StartCampaign_RoleWithoutPermission_ReturnsForbidden()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync("Viewer");

        var response = await client.PostAsJsonAsync(Url, new { Id = Guid.NewGuid() }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Security: authenticated endpoint requires CSRF")]
    public async Task StartCampaign_PostWithoutCsrfToken_IsRefused()
    {
        var campaign = await SeedCampaignAsync();
        var client = CreateRawClient();
        await LoginAsync(client);

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ECampaignStatus.Draft, (await FindCampaignAsync(campaign.Id))!.Status);
    }
}
