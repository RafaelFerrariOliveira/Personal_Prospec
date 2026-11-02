using System.Net;
using System.Net.Http.Json;
using PersonalProspec.Domain.Enums;
using PersonalProspec.IntegrationTest.Settings;
using PersonalProspec.IntegrationTest.Settings.Seeds;

namespace PersonalProspec.IntegrationTest.Executions.CampaignControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class CreateCampaign(DatabaseFixture fixture) : CampaignIntegrationTestBase(fixture)
{
    private const string Url = $"{CampaignUrl}/create_campaign";

    [Fact]
    [Trait("e2e", "Perfect setting")]
    public async Task CreateCampaign_ValidRequest_SavesDraftWithServerIdAndEvent()
    {
        var client = await AdminClientAsync();
        var requestId = Guid.NewGuid();
        var payload = await BuildCampaignPayloadAsync(requestId);

        var response = await client.PostAsJsonAsync(Url, payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var campaign = Assert.Single(await LoadAllCampaignsAsync());
        Assert.Equal(ECampaignStatus.Draft, campaign.Status);
        Assert.Equal(requestId, campaign.RequestId);
        Assert.NotEqual(requestId, campaign.Id);
        Assert.Equal(SystemSeedIdTools.BusinessUnitId, campaign.BusinessUnitId);
        var saved = await FindCampaignAsync(campaign.Id);
        Assert.Single(saved!.Locations);
        Assert.Single(saved.Cnaes);
        Assert.Contains(await LoadCampaignEventsAsync(campaign.Id), e => e.Type == "CampaignCreated");
    }

    [Fact]
    [Trait("e2e", "Idempotency: same request id twice")]
    public async Task CreateCampaign_SameRequestIdTwiceInParallel_CreatesOnlyOne()
    {
        var client = await AdminClientAsync();
        var payload = await BuildCampaignPayloadAsync(Guid.NewGuid());

        var responses = await Task.WhenAll(
            client.PostAsJsonAsync(Url, payload, TestContext.Current.CancellationToken),
            client.PostAsJsonAsync(Url, payload, TestContext.Current.CancellationToken));

        Assert.All(responses, r => Assert.Equal(HttpStatusCode.OK, r.StatusCode));
        Assert.Single(await LoadAllCampaignsAsync());
    }

    [Fact]
    [Trait("e2e", "Idempotency: same request id with different data")]
    public async Task CreateCampaign_SameRequestIdWithDifferentData_ReturnsBadRequest()
    {
        var client = await AdminClientAsync();
        var requestId = Guid.NewGuid();
        await client.PostAsJsonAsync(Url, await BuildCampaignPayloadAsync(requestId), TestContext.Current.CancellationToken);

        var response = await client.PostAsJsonAsync(
            Url, await BuildCampaignPayloadAsync(requestId, name: "Outro nome"), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Single(await LoadAllCampaignsAsync());
    }

    [Fact]
    [Trait("e2e", "Return Status 400 Bad Request: required fields")]
    public async Task CreateCampaign_EmptyNameAndNoCnae_ReturnsBadRequestAndSavesNothing()
    {
        var client = await AdminClientAsync();
        var payload = await BuildCampaignPayloadAsync(Guid.NewGuid(), name: "   ");
        payload["cnaeCodes"] = Array.Empty<string>();

        var response = await client.PostAsJsonAsync(Url, payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Empty(await LoadAllCampaignsAsync());
    }

    [Fact]
    [Trait("e2e", "Return Status 400 Bad Request: unknown reference")]
    public async Task CreateCampaign_UnknownCnae_ReturnsBadRequest()
    {
        var client = await AdminClientAsync();
        var payload = await BuildCampaignPayloadAsync(Guid.NewGuid());
        payload["cnaeCodes"] = new[] { "0000000" };

        var response = await client.PostAsJsonAsync(Url, payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Empty(await LoadAllCampaignsAsync());
    }

    [Fact]
    [Trait("e2e", "Return Status 401 Unauthorized")]
    public async Task CreateCampaign_WithoutSession_ReturnsUnauthorized()
    {
        var client = await CreateAnonymousClientWithCsrfAsync();

        var response = await client.PostAsJsonAsync(
            Url, await BuildCampaignPayloadAsync(Guid.NewGuid()), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Return Status 403 Forbidden")]
    public async Task CreateCampaign_RoleWithoutPermission_ReturnsForbidden()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync("Viewer");

        var response = await client.PostAsJsonAsync(
            Url, await BuildCampaignPayloadAsync(Guid.NewGuid()), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Security: authenticated endpoint requires CSRF")]
    public async Task CreateCampaign_PostWithoutCsrfToken_IsRefusedAndSavesNothing()
    {
        var client = CreateRawClient();
        await LoginAsync(client);

        var response = await client.PostAsJsonAsync(
            Url, await BuildCampaignPayloadAsync(Guid.NewGuid()), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Empty(await LoadAllCampaignsAsync());
    }

    [Fact]
    [Trait("e2e", "Security: tenant comes from the claim")]
    public async Task CreateCampaign_ClaimOfAnotherBusinessUnit_SavesInThatBusinessUnitOnly()
    {
        var otherBusinessUnit = Guid.NewGuid();
        var client = await AdminClientAsync(otherBusinessUnit);

        var response = await client.PostAsJsonAsync(
            Url, await BuildCampaignPayloadAsync(Guid.NewGuid()), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(otherBusinessUnit, Assert.Single(await LoadAllCampaignsAsync()).BusinessUnitId);
    }
}
