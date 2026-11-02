using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NodaTime;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Domain.Providers;
using PersonalProspec.Infra.ORM.Contexts;
using PersonalProspec.Infra.ORM.Seeds;
using PersonalProspec.IntegrationTest.Settings;
using PersonalProspec.IntegrationTest.Settings.Seeds;

namespace PersonalProspec.IntegrationTest.Executions.SeedTests;

// Fica na integração (SQL Server do contêiner): não há provedor InMemory/SQLite no projeto.
[Collection(IntegrationCollection.Name)]
public sealed class InitialSeedTests(DatabaseFixture fixture) : IntegrationTestBase(fixture)
{
    private const string OtherPassword = "outra-senha-ficticia-9";

    private async Task ClearAccountsAndRolesAsync()
    {
        await using var connection = new SqlConnection(Fixture.ConnectionString);
        await connection.OpenAsync();
        await using var command = new SqlCommand("DELETE FROM APP.[User]; DELETE FROM APP.[Role];", connection);
        await command.ExecuteNonQueryAsync();
    }

    private async Task RunSeedAsync(SeedOptions? options = null)
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var sp = scope.ServiceProvider;

        var seed = options is null
            ? sp.GetRequiredService<InitialSeed>()
            : new InitialSeed(
                sp.GetRequiredService<ApplicationContext>(),
                sp.GetRequiredService<IPasswordHasher<User>>(),
                options,
                sp.GetRequiredService<IClock>());

        await seed.RunAsync();
    }

    private async Task<List<User>> LoadUsersAsync()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationContext>();

        return await context.Set<User>().IgnoreQueryFilters().AsNoTracking().ToListAsync(TestContext.Current.CancellationToken);
    }

    private async Task<int> CountRolesAsync()
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationContext>();

        return await context.Set<Role>().CountAsync(TestContext.Current.CancellationToken);
    }

    [Fact]
    [Trait("Categoria", "Seed inicial")]
    public async Task RunAsync_EmptyDatabase_CreatesRoleAndAccount()
    {
        await ClearAccountsAndRolesAsync();

        await RunSeedAsync();

        var user = Assert.Single(await LoadUsersAsync());
        Assert.Equal(1, await CountRolesAsync());
        Assert.Equal(SystemSeedIdTools.TestEmail, user.Email);
        Assert.Equal(SystemSeedIdTools.AdministratorRoleId, user.RoleId);
        Assert.Equal(SystemSeedIdTools.BusinessUnitId, user.BusinessUnitId);
        Assert.NotEqual(SystemSeedIdTools.TestPassword, user.PasswordHash);
        Assert.False(string.IsNullOrWhiteSpace(user.SecurityStamp));
    }

    [Fact]
    [Trait("Categoria", "Seed inicial")]
    public async Task RunAsync_SecondExecution_IsIdempotent()
    {
        await ClearAccountsAndRolesAsync();
        await RunSeedAsync();
        var first = Assert.Single(await LoadUsersAsync());

        await RunSeedAsync();

        var second = Assert.Single(await LoadUsersAsync());
        Assert.Equal(1, await CountRolesAsync());
        Assert.Equal(first.Id, second.Id);
        Assert.Equal(first.PasswordHash, second.PasswordHash);
    }

    [Fact]
    [Trait("Categoria", "Seed inicial")]
    public async Task RunAsync_AccountAlreadyExists_DoesNotCreateSecondAccount()
    {
        var existing = Assert.Single(await LoadUsersAsync());

        await RunSeedAsync(new SeedOptions { Email = "outra.conta@exemplo.test", Password = OtherPassword });

        var users = await LoadUsersAsync();
        var user = Assert.Single(users);
        Assert.Equal(existing.Id, user.Id);
        Assert.Equal(SystemSeedIdTools.TestEmail, user.Email);
    }

    [Fact]
    [Trait("Categoria", "Seed inicial")]
    public async Task RunAsync_EmailWithSpacesAndUpperCase_StoresNormalizedEmail()
    {
        await ClearAccountsAndRolesAsync();

        await RunSeedAsync(new SeedOptions { Email = "  Conta.Teste@Exemplo.TEST ", Password = OtherPassword });

        var user = Assert.Single(await LoadUsersAsync());
        Assert.Equal("conta.teste@exemplo.test", user.Email);
        Assert.Equal("CONTA.TESTE@EXEMPLO.TEST", user.NormalizedEmail);
    }

    [Fact]
    [Trait("Categoria", "Seed inicial")]
    public async Task RunAsync_NewAccount_NeverLogsPasswordOrEmail()
    {
        await ClearAccountsAndRolesAsync();

        await RunSeedAsync(new SeedOptions { Email = "conta.log@exemplo.test", Password = OtherPassword });

        var messages = Fixture.Factory.Logs.Messages;
        Assert.DoesNotContain(messages, m => m.Contains(OtherPassword));
        Assert.DoesNotContain(messages, m => m.Contains(SystemSeedIdTools.TestPassword));
    }
}
