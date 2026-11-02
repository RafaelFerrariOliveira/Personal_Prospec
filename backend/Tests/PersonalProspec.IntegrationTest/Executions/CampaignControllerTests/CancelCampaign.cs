using System.Net;
using System.Net.Http.Json;
using PersonalProspec.Domain.Enums;
using PersonalProspec.IntegrationTest.Settings;

namespace PersonalProspec.IntegrationTest.Executions.CampaignControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class CancelCampaign(DatabaseFixture fixture) : CampaignIntegrationTestBase(fixture)
{
    private const string Url = $"{CampaignUrl}/cancel_campaign";

    [Theory]
    [InlineData(ECampaignStatus.Draft)]
    [InlineData(ECampaignStatus.Running)]
    [InlineData(ECampaignStatus.Paused)]
    [Trait("e2e", "Perfect setting")]
    public async Task CancelCampaign_UnfinishedCampaign_BecomesCancelledKeepingChildrenAndRecordsEvent(ECampaignStatus status)
    {
        var campaign = await SeedCampaignAsync(status: status);
        var client = await AdminClientAsync();

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var saved = await FindCampaignAsync(campaign.Id);
        Assert.Equal(ECampaignStatus.Cancelled, saved!.Status);
        Assert.Single(saved.Locations);
        Assert.Single(saved.Cnaes);
        Assert.Contains(await LoadCampaignEventsAsync(campaign.Id), e => e.Type == "CampaignCancelled");
    }

    [Fact]
    [Trait("e2e", "Return Status 400 Bad Request: invalid transition")]
    public async Task CancelCampaign_AlreadyCancelled_ReturnsBadRequest()
    {
        var campaign = await SeedCampaignAsync(status: ECampaignStatus.Cancelled);
        var client = await AdminClientAsync();

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Security: other tenant must not be changed")]
    public async Task CancelCampaign_CampaignOfAnotherBusinessUnit_KeepsStatus()
    {
        var campaign = await SeedCampaignAsync(Guid.NewGuid(), ECampaignStatus.Running);
        var client = await AdminClientAsync();

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ECampaignStatus.Running, (await FindCampaignAsync(campaign.Id))!.Status);
    }

    [Fact]
    [Trait("e2e", "Return Status 401 Unauthorized")]
    public async Task CancelCampaign_WithoutSession_ReturnsUnauthorized()
    {
        var client = await CreateAnonymousClientWithCsrfAsync();

        var response = await client.PostAsJsonAsync(Url, new { Id = Guid.NewGuid() }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Return Status 403 Forbidden")]
    public async Task CancelCampaign_RoleWithoutPermission_ReturnsForbidden()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync("Viewer");

        var response = await client.PostAsJsonAsync(Url, new { Id = Guid.NewGuid() }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Security: authenticated endpoint requires CSRF")]
    public async Task CancelCampaign_PostWithoutCsrfToken_IsRefused()
    {
        var campaign = await SeedCampaignAsync();
        var client = CreateRawClient();
        await LoginAsync(client);

        var response = await client.PostAsJsonAsync(Url, new { campaign.Id }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ECampaignStatus.Draft, (await FindCampaignAsync(campaign.Id))!.Status);
    }
}
