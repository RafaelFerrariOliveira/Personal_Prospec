using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Net.Http.Headers;
using PersonalProspec.Infra.ORM.Contexts;
using PersonalProspec.IntegrationTest.Settings.Seeds;

namespace PersonalProspec.IntegrationTest.Settings;

public abstract class IntegrationTestBase(DatabaseFixture fixture) : IAsyncLifetime
{
    private const string CsrfHeader = "X-CSRF-TOKEN";

    protected static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    protected DatabaseFixture Fixture { get; } = fixture;

    public async ValueTask InitializeAsync() => await Fixture.ResetAsync();

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;

    protected Task<HttpClient> CreateAnonymousClientWithCsrfAsync() =>
        CreateClientWithCsrfAsync(role: null, userId: null, businessUnitId: null);

    // Autentica pelo TestAuthHandler (headers X-Test-*) e exercita o CSRF de verdade.
    protected Task<HttpClient> CreateAuthenticatedClientWithCsrfAsync(
        string role, Guid? userId = null, Guid? businessUnitId = null) =>
        CreateClientWithCsrfAsync(role, userId, businessUnitId);

    // Cliente sem token CSRF e sem headers de teste: serve para login real e para provar a recusa de CSRF.
    protected HttpClient CreateRawClient() =>
        Fixture.Factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            // HTTPS: os cookies são Secure e o container de cookies do client só os devolve em HTTPS.
            BaseAddress = new Uri("https://localhost"),
            HandleCookies = true,
            AllowAutoRedirect = false
        });

    // Login REAL da conta semeada: o client guarda os cookies pp_access e pp_refresh.
    protected async Task<HttpResponseMessage> LoginAsync(HttpClient client, string? password = null) =>
        await client.PostAsJsonAsync(
            "api/Authentication/generate_access_token",
            new { email = SystemSeedIdTools.TestEmail, password = password ?? SystemSeedIdTools.TestPassword },
            TestContext.Current.CancellationToken);

    // Valor cru do cookie definido pela resposta (null se a resposta não define esse cookie).
    protected static string? GetSetCookieValue(HttpResponseMessage response, string cookieName) =>
        ParseSetCookies(response).FirstOrDefault(c => c.Name == cookieName)?.Value.Value;

    protected static IReadOnlyList<SetCookieHeaderValue> ParseSetCookies(HttpResponseMessage response) =>
        response.Headers.TryGetValues("Set-Cookie", out var values)
            ? SetCookieHeaderValue.ParseList(values.ToList()).ToList()
            : [];

    protected async Task<T> WithDbAsync<T>(Func<ApplicationContext, Task<T>> action)
    {
        using var scope = Fixture.Factory.Services.CreateScope();
        return await action(scope.ServiceProvider.GetRequiredService<ApplicationContext>());
    }

    protected Task<Guid> GetSeedUserIdAsync() =>
        WithDbAsync(context => context.Set<PersonalProspec.Domain.Entities.Identity.User>()
            .IgnoreQueryFilters()
            .Select(u => u.Id)
            .SingleAsync(TestContext.Current.CancellationToken));

    private async Task<HttpClient> CreateClientWithCsrfAsync(string? role, Guid? userId, Guid? businessUnitId)
    {
        var client = CreateRawClient();

        if (role is not null)
        {
            client.DefaultRequestHeaders.Add(TestAuthHandler.RoleHeader, role);
            client.DefaultRequestHeaders.Add(TestAuthHandler.BusinessUnitHeader,
                (businessUnitId ?? SystemSeedIdTools.BusinessUnitId).ToString());

            // Id fixo por cliente: o token antiforgery de usuário autenticado é amarrado ao claim de id.
            client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, (userId ?? Guid.NewGuid()).ToString());
        }

        await AddCsrfHeaderAsync(client);

        return client;
    }

    // GET api/Antiforgery/token com o mesmo client (cookie de antiforgery fica no jar) e header nas escritas.
    protected async Task AddCsrfHeaderAsync(HttpClient client)
    {
        var response = await client.GetAsync("api/Antiforgery/token", TestContext.Current.CancellationToken);
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<JsonElement>(JsonOptions, TestContext.Current.CancellationToken);
        client.DefaultRequestHeaders.Remove(CsrfHeader);
        client.DefaultRequestHeaders.Add(CsrfHeader, body.GetProperty("token").GetString());
    }
}
