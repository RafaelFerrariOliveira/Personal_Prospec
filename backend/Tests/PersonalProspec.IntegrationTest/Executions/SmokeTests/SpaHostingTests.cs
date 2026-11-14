using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using PersonalProspec.IntegrationTest.Settings;

namespace PersonalProspec.IntegrationTest.Executions.SmokeTests;

// Publicação única: o build do React em wwwroot é servido pelo próprio API.
[Collection(IntegrationCollection.Name)]
public sealed class SpaHostingTests(DatabaseFixture fixture) : IntegrationTestBase(fixture), IDisposable
{
    private const string IndexHtml = "<!doctype html><title>Personal Prospec</title>";
    private readonly string _webRoot = Directory.CreateTempSubdirectory("pp-wwwroot-").FullName;

    private HttpClient CreateClientWithWebRoot()
    {
        File.WriteAllText(Path.Combine(_webRoot, "index.html"), IndexHtml);

        return Fixture.Factory
            .WithWebHostBuilder(builder => builder.UseWebRoot(_webRoot))
            .CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });
    }

    [Theory]
    [Trait("Categoria", "Publicação do front")]
    [InlineData("/")]
    [InlineData("/campaigns/new")]
    public async Task Get_FrontRoute_ReturnsIndexHtml(string path)
    {
        var client = CreateClientWithWebRoot();

        var response = await client.GetAsync(path, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(IndexHtml, await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    [Trait("Categoria", "Publicação do front")]
    public async Task Get_UnknownApiRoute_KeepsApiBehaviorInsteadOfIndexHtml()
    {
        var client = CreateClientWithWebRoot();

        var response = await client.GetAsync("/api/rota-inexistente", TestContext.Current.CancellationToken);

        // Sem sessão, a política global da API responde 401; o importante é nunca devolver o index.html.
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.NotEqual(IndexHtml, await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }

    public void Dispose() => Directory.Delete(_webRoot, recursive: true);
}
