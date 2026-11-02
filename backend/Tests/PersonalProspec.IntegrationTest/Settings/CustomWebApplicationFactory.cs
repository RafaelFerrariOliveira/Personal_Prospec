using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using PersonalProspec.Api;
using PersonalProspec.IntegrationTest.Settings.Seeds;

namespace PersonalProspec.IntegrationTest.Settings;

public sealed class CustomWebApplicationFactory(string connectionString) : WebApplicationFactory<Program>
{
    public CapturingLoggerProvider Logs { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Ambiente próprio: não é Development, então os user-secrets reais da Api nunca são carregados.
        builder.UseEnvironment("Testing");

        // Options FALSAS.
        var settings = new Dictionary<string, string>
        {
            ["ConnectionStrings:DefaultConnection"] = connectionString,
            ["Pepper:Secret"] = "pepper-ficticio-de-teste",
            ["JwtToken:JwtKey"] = "chave-jwt-ficticia-de-teste-com-mais-de-32-bytes",
            ["JwtToken:Issuer"] = "PersonalProspec.Test",
            ["JwtToken:Audience"] = "PersonalProspec.Test.Front",
            ["JwtToken:AccessTokenMinutes"] = "15",
            ["JwtToken:RefreshTokenMinutes"] = "30",
            ["Seed:Email"] = SystemSeedIdTools.TestEmail,
            ["Seed:Password"] = SystemSeedIdTools.TestPassword,
            ["RateLimiting:PermitLimitPerMinute"] = "1000000"
        };

        foreach (var (key, value) in settings)
            builder.UseSetting(key, value);

        builder.ConfigureLogging(logging => logging.AddProvider(Logs));

        builder.ConfigureServices(services =>
        {
            // Com header X-Test-Role autentica pelo handler de teste; sem ele, JwtBearer real (cookie).
            services.AddAuthentication(options => options.DefaultScheme = TestAuthHandler.PolicySchemeName)
                .AddPolicyScheme(TestAuthHandler.PolicySchemeName, TestAuthHandler.PolicySchemeName, options =>
                    options.ForwardDefaultSelector = context =>
                        TestAuthHandler.HasTestHeaders(context.Request)
                            ? TestAuthHandler.SchemeName
                            : JwtBearerDefaults.AuthenticationScheme)
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, _ => { });
        });
    }
}
