using System.Net;
using System.Net.Http.Json;
using PersonalProspec.Domain.Enums;
using PersonalProspec.IntegrationTest.Settings;

namespace PersonalProspec.IntegrationTest.Executions.CampaignControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class PauseCampaign(DatabaseFixture fixture) : CampaignIntegrationTestBase(fixture)
{
    private const string Url = $"{CampaignUrl}/pause_campaign";

    [Fact]
    [Trait("e2e", "Perfect setting")]
    public async Task PauseCampaign_RunningCampaign_BecomesPausedAndRecordsEvent()
    {
        var campaign = await SeedCampaignAsync(status: ECampaignStatus.Running);
        var client = await AdminClientAsync();

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ECampaignStatus.Paused, (await FindCampaignAsync(campaign.Id))!.Status);
        Assert.Contains(await LoadCampaignEventsAsync(campaign.Id), e => e.Type == "CampaignPaused");
    }

    [Fact]
    [Trait("e2e", "Return Status 400 Bad Request: invalid transition")]
    public async Task PauseCampaign_DraftCampaign_ReturnsBadRequestAndKeepsStatus()
    {
        var campaign = await SeedCampaignAsync();
        var client = await AdminClientAsync();

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ECampaignStatus.Draft, (await FindCampaignAsync(campaign.Id))!.Status);
    }

    [Fact]
    [Trait("e2e", "Security: other tenant must not be changed")]
    public async Task PauseCampaign_CampaignOfAnotherBusinessUnit_KeepsStatus()
    {
        var campaign = await SeedCampaignAsync(Guid.NewGuid(), ECampaignStatus.Running);
        var client = await AdminClientAsync();

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ECampaignStatus.Running, (await FindCampaignAsync(campaign.Id))!.Status);
    }

    [Fact]
    [Trait("e2e", "Return Status 401 Unauthorized")]
    public async Task PauseCampaign_WithoutSession_ReturnsUnauthorized()
    {
        var client = await CreateAnonymousClientWithCsrfAsync();

        var response = await client.PostAsJsonAsync(Url, new { Id = Guid.NewGuid() }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Return Status 403 Forbidden")]
    public async Task PauseCampaign_RoleWithoutPermission_ReturnsForbidden()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync("Viewer");

        var response = await client.PostAsJsonAsync(Url, new { Id = Guid.NewGuid() }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Security: authenticated endpoint requires CSRF")]
    public async Task PauseCampaign_PostWithoutCsrfToken_IsRefused()
    {
        var campaign = await SeedCampaignAsync(status: ECampaignStatus.Running);
        var client = CreateRawClient();
        await LoginAsync(client);

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ECampaignStatus.Running, (await FindCampaignAsync(campaign.Id))!.Status);
    }
}
