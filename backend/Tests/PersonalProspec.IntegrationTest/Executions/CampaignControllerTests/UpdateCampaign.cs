using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.IntegrationTest.Settings;

namespace PersonalProspec.IntegrationTest.Executions.CampaignControllerTests;

[Collection(IntegrationCollection.Name)]
public sealed class UpdateCampaign(DatabaseFixture fixture) : CampaignIntegrationTestBase(fixture)
{
    private const string Url = $"{CampaignUrl}/update_campaign";

    [Theory]
    [InlineData(ECampaignStatus.Draft)]
    [InlineData(ECampaignStatus.Paused)]
    [Trait("e2e", "Perfect setting")]
    public async Task UpdateCampaign_EditableStatus_SavesChangesAndRecordsEventWithFieldNames(ECampaignStatus status)
    {
        var campaign = await SeedCampaignAsync(status: status);
        var client = await AdminClientAsync();
        var payload = await BuildCampaignPayloadAsync(id: campaign.Id, name: "Nome alterado");

        var response = await client.PutAsJsonAsync(Url, payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var saved = await FindCampaignAsync(campaign.Id);
        Assert.Equal("Nome alterado", saved!.Name);
        var recorded = Assert.Single(await LoadCampaignEventsAsync(campaign.Id), e => e.Type == "CampaignUpdated");
        Assert.Contains("Name", recorded.Description);
        Assert.DoesNotContain("Nome alterado", recorded.Description);
    }

    [Fact]
    [Trait("e2e", "Children replaced")]
    public async Task UpdateCampaign_NewLocationsAndCnae_ReplacesChildren()
    {
        var campaign = await SeedCampaignAsync();
        var second = await WithDbAsync(c => c.Set<Municipality>().AsNoTracking()
            .Where(m => m.State == "SP").OrderByDescending(m => m.Code).FirstAsync(TestContext.Current.CancellationToken));
        var client = await AdminClientAsync();
        var payload = await BuildCampaignPayloadAsync(id: campaign.Id, name: campaign.Name);
        var (firstCode, cnaeCode) = await GetReferencesAsync();
        payload["locations"] = new[]
        {
            new { state = "SP", municipalityCode = firstCode },
            new { state = "SP", municipalityCode = second.Code }
        };

        var response = await client.PutAsJsonAsync(Url, payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var saved = await FindCampaignAsync(campaign.Id);
        Assert.Equal(2, saved!.Locations.Count);
        Assert.Equal(cnaeCode, Assert.Single(saved.Cnaes).CnaeCode);
    }

    [Fact]
    [Trait("e2e", "Return Status 400 Bad Request: running campaign is not editable")]
    public async Task UpdateCampaign_RunningCampaign_ReturnsBadRequestAndChangesNothing()
    {
        var campaign = await SeedCampaignAsync(status: ECampaignStatus.Running);
        var client = await AdminClientAsync();
        var payload = await BuildCampaignPayloadAsync(id: campaign.Id, name: "Nome alterado");

        var response = await client.PutAsJsonAsync(Url, payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("Campanha semeada", (await FindCampaignAsync(campaign.Id))!.Name);
        Assert.DoesNotContain(await LoadCampaignEventsAsync(campaign.Id), e => e.Type == "CampaignUpdated");
    }

    [Fact]
    [Trait("e2e", "Return Status 400 Bad Request: validation")]
    public async Task UpdateCampaign_InvalidData_ReturnsBadRequestAndKeepsOriginal()
    {
        var campaign = await SeedCampaignAsync();
        var client = await AdminClientAsync();
        var payload = await BuildCampaignPayloadAsync(id: campaign.Id, name: "  ");

        var response = await client.PutAsJsonAsync(Url, payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("Campanha semeada", (await FindCampaignAsync(campaign.Id))!.Name);
    }

    [Fact]
    [Trait("e2e", "Security: other tenant must not be changed")]
    public async Task UpdateCampaign_CampaignOfAnotherBusinessUnit_KeepsOriginal()
    {
        var campaign = await SeedCampaignAsync(Guid.NewGuid());
        var client = await AdminClientAsync();
        var payload = await BuildCampaignPayloadAsync(id: campaign.Id, name: "Nome alterado");

        var response = await client.PutAsJsonAsync(Url, payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("Campanha semeada", (await FindCampaignAsync(campaign.Id))!.Name);
    }

    [Fact]
    [Trait("e2e", "Return Status 401 Unauthorized")]
    public async Task UpdateCampaign_WithoutSession_ReturnsUnauthorized()
    {
        var client = await CreateAnonymousClientWithCsrfAsync();

        var response = await client.PutAsJsonAsync(
            Url, await BuildCampaignPayloadAsync(id: Guid.NewGuid()), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Return Status 403 Forbidden")]
    public async Task UpdateCampaign_RoleWithoutPermission_ReturnsForbidden()
    {
        var client = await CreateAuthenticatedClientWithCsrfAsync("Viewer");

        var response = await client.PutAsJsonAsync(
            Url, await BuildCampaignPayloadAsync(id: Guid.NewGuid()), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    [Trait("e2e", "Security: authenticated endpoint requires CSRF")]
    public async Task UpdateCampaign_PutWithoutCsrfToken_IsRefused()
    {
        var campaign = await SeedCampaignAsync();
        var client = CreateRawClient();
        await LoginAsync(client);

        var response = await client.PutAsJsonAsync(
            Url, await BuildCampaignPayloadAsync(id: campaign.Id, name: "Nome alterado"), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("Campanha semeada", (await FindCampaignAsync(campaign.Id))!.Name);
    }
}
