using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.UserPolicies;
using PersonalProspec.IntegrationTest.Settings.Seeds;

namespace PersonalProspec.IntegrationTest.Settings;

// Atalhos comuns aos testes de campanha: referências reais do seed, payloads e leitura direta do banco.
public abstract class CampaignIntegrationTestBase(DatabaseFixture fixture) : IntegrationTestBase(fixture)
{
    protected const string CampaignUrl = "api/Campaign";

    protected Task<HttpClient> AdminClientAsync(Guid? businessUnitId = null) =>
        CreateAuthenticatedClientWithCsrfAsync(Policy.Administrator, businessUnitId: businessUnitId);

    protected async Task<(string MunicipalityCode, string CnaeCode)> GetReferencesAsync()
    {
        var municipality = await WithDbAsync(c => c.Set<Municipality>().AsNoTracking()
            .FirstAsync(m => m.State == "SP", TestContext.Current.CancellationToken));
        var cnae = await WithDbAsync(c => c.Set<Cnae>().AsNoTracking()
            .FirstAsync(TestContext.Current.CancellationToken));

        return (municipality.Code, cnae.Code);
    }

    protected async Task<Dictionary<string, object?>> BuildCampaignPayloadAsync(
        Guid? requestId = null,
        Guid? id = null,
        string name = "Campanha de integração")
    {
        var (municipalityCode, cnaeCode) = await GetReferencesAsync();

        var payload = new Dictionary<string, object?>
        {
            ["name"] = name,
            ["objective"] = "Encontrar clientes",
            ["segment"] = "Tecnologia",
            ["targetLeadCount"] = 50,
            ["locations"] = new[] { new { state = "SP", municipalityCode } },
            ["cnaeCodes"] = new[] { cnaeCode }
        };

        if (requestId is not null)
            payload["requestId"] = requestId;

        if (id is not null)
            payload["id"] = id;

        return payload;
    }

    protected Task<Campaign> SeedCampaignAsync(
        Guid? businessUnitId = null,
        ECampaignStatus status = ECampaignStatus.Draft,
        string name = "Campanha semeada") =>
        WithDbAsync(c => CampaignSeedTools.CreateCampaignAsync(
            c, businessUnitId ?? SystemSeedIdTools.BusinessUnitId, status, name));

    protected Task<Campaign?> FindCampaignAsync(Guid id) =>
        WithDbAsync(c => c.Set<Campaign>().IgnoreQueryFilters().AsNoTracking()
            .Include(x => x.Locations).Include(x => x.Cnaes)
            .FirstOrDefaultAsync(x => x.Id == id, TestContext.Current.CancellationToken));

    protected Task<List<Campaign>> LoadAllCampaignsAsync() =>
        WithDbAsync(c => c.Set<Campaign>().IgnoreQueryFilters().AsNoTracking()
            .ToListAsync(TestContext.Current.CancellationToken));

    protected Task<List<Event>> LoadCampaignEventsAsync(Guid campaignId) =>
        WithDbAsync(c => c.Set<Event>().IgnoreQueryFilters().AsNoTracking()
            .Where(e => e.CampaignId == campaignId)
            .OrderBy(e => e.OccurredAt)
            .ToListAsync(TestContext.Current.CancellationToken));

    protected static async Task<JsonElement> ReadJsonAsync(HttpResponseMessage response) =>
        await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions, TestContext.Current.CancellationToken);
}
