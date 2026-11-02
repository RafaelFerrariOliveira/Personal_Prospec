using System.Net;
using System.Net.Http.Json;
using PersonalProspec.Domain.Enums;
using PersonalProspec.IntegrationTest.Settings;

namespace PersonalProspec.IntegrationTest.Executions.CampaignControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class ResumeCampaign(DatabaseFixture fixture) : CampaignIntegrationTestBase(fixture)
{
    private const string Url = $"{CampaignUrl}/resume_campaign";

    [Fact]
    [Trait("e2e", "Perfect setting")]
    public async Task ResumeCampaign_PausedCampaign_BecomesRunningAndRecordsEvent()
    {
        var campaign = await SeedCampaignAsync(status: ECampaignStatus.Paused);
        var client = await AdminClientAsync();

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ECampaignStatus.Running, (await FindCampaignAsync(campaign.Id))!.Status);
        Assert.Contains(await LoadCampaignEventsAsync(campaign.Id), e => e.Type == "CampaignResumed");
    }

    [Fact]
    [Trait("e2e", "Return Status 400 Bad Request: invalid transition")]
    public async Task ResumeCampaign_DraftCampaign_ReturnsBadRequestAndKeepsStatus()
    {
        var campaign = await SeedCampaignAsync();
        var client = await AdminClientAsync();

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ECampaignStatus.Draft, (await FindCampaignAsync(campaign.Id))!.Status);
    }

    [Fact]
    [Trait("e2e", "Security: other tenant must not be changed")]
    public async Task ResumeCampaign_CampaignOfAnotherBusinessUnit_KeepsStatus()
    {
        var campaign = await SeedCampaignAsync(Guid.NewGuid(), ECampaignStatus.Paused);
        var client = await AdminClientAsync();

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ECampaignStatus.Paused, (await FindCampaignAsync(campaign.Id))!.Status);
    }

    [Fact]
    [Trait("e2e", "Return Status 401 Unauthorized")]
    public async Task ResumeCampaign_WithoutSession_ReturnsUnauthorized()
    {
        var client = await CreateAnonymousClientWithCsrfAsync();

        var response = await client.PostAsJsonAsync(Url, new { Id = Guid.NewGuid() }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Return Status 403 Forbidden")]
    public async Task ResumeCampaign_RoleWithoutPermission_ReturnsForbidden()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync("Viewer");

        var response = await client.PostAsJsonAsync(Url, new { Id = Guid.NewGuid() }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Security: authenticated endpoint requires CSRF")]
    public async Task ResumeCampaign_PostWithoutCsrfToken_IsRefused()
    {
        var campaign = await SeedCampaignAsync(status: ECampaignStatus.Paused);
        var client = CreateRawClient();
        await LoginAsync(client);

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ECampaignStatus.Paused, (await FindCampaignAsync(campaign.Id))!.Status);
    }
}
