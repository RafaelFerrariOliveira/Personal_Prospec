using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.DependencyInjection;
using PersonalProspec.Infra.ORM.Seeds;
using Respawn;
using Respawn.Graph;

namespace PersonalProspec.IntegrationTest.Settings;

[CollectionDefinition(Name)]
public sealed class IntegrationCollection : ICollectionFixture<DatabaseFixture>
{
    public const string Name = "Integration";
}

// Um contêiner SQL Server e um host por execução; o estado do banco volta ao seed a cada teste.
public sealed class DatabaseFixture : IAsyncLifetime
{
    // A rede corporativa bloqueia o MCR (mcr.microsoft.com).
    private const string Image = "rapidfort/microsoft-sql-server-2019-ib";
    private const int SqlServerPort = 1433;

    // Descartável: vale só para o contêiner efêmero do teste. Atende a complexidade exigida pelo SQL Server.
    private readonly string _saPassword = $"Pp!{Guid.NewGuid():N}";

    // Contêiner genérico em vez do MsSqlBuilder: o módulo espera o SQL Server pelo sqlcmd e o
    // localiza com `find`, que a imagem rapidfort não tem. Aqui a espera é pela mensagem de log.
    private IContainer? _container;
    private Respawner _respawner = null!;

    public CustomWebApplicationFactory Factory { get; private set; } = null!;
    public string ConnectionString { get; private set; } = string.Empty;

    public async ValueTask InitializeAsync()
    {
        _container = new ContainerBuilder(Image)
            .WithEnvironment("ACCEPT_EULA", "Y")
            .WithEnvironment("MSSQL_SA_PASSWORD", _saPassword)
            .WithPortBinding(SqlServerPort, true)
            .WithWaitStrategy(Wait.ForUnixContainer().UntilMessageIsLogged("SQL Server is now ready for client connections"))
            .Build();

        await _container.StartAsync();

        ConnectionString = new SqlConnectionStringBuilder
        {
            DataSource = $"{_container.Hostname},{_container.GetMappedPublicPort(SqlServerPort)}",
            UserID = "sa",
            Password = _saPassword,
            InitialCatalog = "PersonalProspecTest",
            TrustServerCertificate = true
        }.ConnectionString;

        // O host de teste aplica as migrations e o seed na subida (Program.cs).
        Factory = new CustomWebApplicationFactory(ConnectionString);
        _ = Factory.Server;

        await EnsureSeedAsync();

        await using var connection = new SqlConnection(ConnectionString);
        await connection.OpenAsync();

        // Preserva só o seed imutável (Role, Cnae e Municipality) e o histórico de migrations; User é refeito a cada teste.
        _respawner = await Respawner.CreateAsync(connection, new RespawnerOptions
        {
            DbAdapter = DbAdapter.SqlServer,
            TablesToIgnore =
            [
                new Table("APP", "Role"), new Table("APP", "Cnae"), new Table("APP", "Municipality"),
                new Table("__EFMigrationsHistory")
            ]
        });
    }

    // Limpa o banco e reaplica o seed da conta de teste (isolamento: senha e bloqueio não vazam entre testes).
    public async Task ResetAsync()
    {
        await using var connection = new SqlConnection(ConnectionString);
        await connection.OpenAsync();
        await _respawner.ResetAsync(connection);

        using var scope = Factory.Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<InitialSeed>().RunAsync();
    }

    public async ValueTask DisposeAsync()
    {
        if (Factory is not null)
            await Factory.DisposeAsync();

        if (_container is not null)
            await _container.DisposeAsync();
    }

    private async Task EnsureSeedAsync()
    {
        await using var connection = new SqlConnection(ConnectionString);
        await connection.OpenAsync();

        var roles = await CountAsync(connection, "APP.[Role]");
        var users = await CountAsync(connection, "APP.[User]");

        if (roles != 1 || users != 1)
            throw new InvalidOperationException(
                $"Seed do banco de teste inválido: esperado 1 role e 1 conta, encontrado {roles} role(s) e {users} conta(s).");
    }

    private static async Task<int> CountAsync(SqlConnection connection, string table)
    {
        await using var command = new SqlCommand($"SELECT COUNT(*) FROM {table}", connection);
        return (int)(await command.ExecuteScalarAsync())!;
    }
}
