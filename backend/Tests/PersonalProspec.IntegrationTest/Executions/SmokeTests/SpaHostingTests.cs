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
    private const string AssetJs = "console.log('personal prospec');";
    private readonly string _webRoot = Directory.CreateTempSubdirectory("pp-wwwroot-").FullName;

    private HttpClient CreateClientWithWebRoot()
    {
        File.WriteAllText(Path.Combine(_webRoot, "index.html"), IndexHtml);
        Directory.CreateDirectory(Path.Combine(_webRoot, "assets"));
        File.WriteAllText(Path.Combine(_webRoot, "assets", "index-abc123.js"), AssetJs);

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
    public async Task Get_BuildAsset_ReturnsTheJavaScriptFileInsteadOfIndexHtml()
    {
        var client = CreateClientWithWebRoot();

        var response = await client.GetAsync("/assets/index-abc123.js", TestContext.Current.CancellationToken);

        // Regressão: sem nonfile no fallback, o asset voltava como index.html e o navegador ficava em branco.
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/javascript", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal(AssetJs, await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
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
