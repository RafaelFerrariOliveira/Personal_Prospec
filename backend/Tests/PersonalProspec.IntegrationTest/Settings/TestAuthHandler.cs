using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using PersonalProspec.Domain.Constants;
using PersonalProspec.IntegrationTest.Settings.Seeds;

namespace PersonalProspec.IntegrationTest.Settings;

// Só autentica quando o header X-Test-Role existe; sem ele o esquema de política cai no JwtBearer real.
public sealed class TestAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Test";
    public const string PolicySchemeName = "TestOrJwt";
    public const string RoleHeader = "X-Test-Role";
    public const string UserIdHeader = "X-Test-UserId";
    public const string EmailHeader = "X-Test-Email";
    public const string BusinessUnitHeader = "X-Test-BusinessUnit";

    public static bool HasTestHeaders(HttpRequest request) => request.Headers.ContainsKey(RoleHeader);

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var headers = Request.Headers;

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, headers[UserIdHeader].FirstOrDefault() ?? Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Email, headers[EmailHeader].FirstOrDefault() ?? SystemSeedIdTools.TestEmail),
            new Claim(ClaimTypes.Role, headers[RoleHeader].First()!),
            new Claim(CustomClaim.BusinessUnit,
                headers[BusinessUnitHeader].FirstOrDefault() ?? SystemSeedIdTools.BusinessUnitId.ToString())
        };

        var identity = new ClaimsIdentity(claims, SchemeName);
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
