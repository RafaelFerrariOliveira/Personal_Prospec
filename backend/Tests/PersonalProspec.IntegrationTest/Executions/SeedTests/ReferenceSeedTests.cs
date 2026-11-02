using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Infra.ORM.Contexts;
using PersonalProspec.Infra.ORM.Seeds;
using PersonalProspec.IntegrationTest.Settings;

namespace PersonalProspec.IntegrationTest.Executions.SeedTests;

// Cnae e Municipality são preservados pelo Respawn; cada teste deixa as tabelas completas ao terminar.
[Collection(IntegrationCollection.Name)]
public sealed class ReferenceSeedTests(DatabaseFixture fixture) : IntegrationTestBase(fixture)
{
    private const int ExpectedCnaes = 1358;
    private const int ExpectedMunicipalities = 5571;

    private async Task RunSeedAsync()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<ReferenceSeed>().RunAsync();
    }

    private async Task<(int Cnaes, int Municipalities, int States)> CountAsync()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationContext>();
        var token = TestContext.Current.CancellationToken;

        return (
            await context.Set<Cnae>().CountAsync(token),
            await context.Set<Municipality>().CountAsync(token),
            await context.Set<Municipality>().Select(m => m.State).Distinct().CountAsync(token));
    }

    [Fact]
    [Trait("Seed", "Perfect setting")]
    public async Task RunAsync_HostStartup_LoadsEveryCnaeAndMunicipalityInTwentySevenStates()
    {
        var (cnaes, municipalities, states) = await CountAsync();

        Assert.Equal(ExpectedCnaes, cnaes);
        Assert.Equal(ExpectedMunicipalities, municipalities);
        Assert.Equal(27, states);
    }

    [Fact]
    [Trait("Seed", "Idempotency")]
    public async Task RunAsync_SecondRun_DoesNotDuplicateRows()
    {
        await RunSeedAsync();

        var (cnaes, municipalities, _) = await CountAsync();
        Assert.Equal(ExpectedCnaes, cnaes);
        Assert.Equal(ExpectedMunicipalities, municipalities);
    }

    [Fact]
    [Trait("Seed", "Fills only what is missing")]
    public async Task RunAsync_SomeRowsMissing_RestoresOnlyTheMissingOnes()
    {
        await using (var connection = new SqlConnection(Fixture.ConnectionString))
        {
            await connection.OpenAsync(TestContext.Current.CancellationToken);
            await using var command = new SqlCommand(
                "DELETE TOP (5) FROM APP.[Cnae]; DELETE TOP (5) FROM APP.[Municipality];", connection);
            await command.ExecuteNonQueryAsync(TestContext.Current.CancellationToken);
        }

        await RunSeedAsync();

        var (cnaes, municipalities, _) = await CountAsync();
        Assert.Equal(ExpectedCnaes, cnaes);
        Assert.Equal(ExpectedMunicipalities, municipalities);
    }

    [Fact]
    [Trait("Seed", "Text encoding")]
    public async Task RunAsync_AccentedDescription_IsStoredAsUtf8()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationContext>();

        var cnae = await context.Set<Cnae>().AsNoTracking()
            .SingleAsync(c => c.Code == "0111399", TestContext.Current.CancellationToken);

        Assert.Equal("Cultivo de outros cereais não especificados anteriormente", cnae.Description);
    }
}
