using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Moq;
using NodaTime;
using PersonalProspec.Api.Handlers;
using PersonalProspec.Domain.Constants;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Domain.Providers;
using PersonalProspec.UnitTest.Builders;

namespace PersonalProspec.UnitTest.Api.Handlers;

public sealed class JwtTokenServiceTests
{
    private const string Key = "chave-ficticia-de-teste-com-32-bytes-ou-mais";
    private static readonly Instant Now = Instant.FromUtc(2026, 11, 2, 12, 0, 0);

    private readonly User _user = UserBuilderTest.NewObject().Build();

    private static JwtTokenService NewService(Instant now)
    {
        var clock = new Mock<IClock>();
        clock.Setup(c => c.GetCurrentInstant()).Returns(now);

        return new JwtTokenService(new JwtTokenOptions
        {
            JwtKey = Key,
            Issuer = "emissor-ficticio",
            Audience = "audiencia-ficticia",
            AccessTokenMinutes = 15,
            RefreshTokenMinutes = 30
        }, clock.Object);
    }

    private static TokenValidationParameters Parameters(string key, bool validateLifetime) =>
        new()
        {
            ValidIssuer = "emissor-ficticio",
            ValidAudience = "audiencia-ficticia",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
            ValidateLifetime = validateLifetime,
            ClockSkew = TimeSpan.Zero
        };

    [Fact]
    [Trait("Categoria", "JWT")]
    public async Task CreateAccessToken_ValidUser_ContainsExpectedClaims()
    {
        var token = NewService(Now).CreateAccessToken(_user, "Administrator");

        var result = await new JsonWebTokenHandler().ValidateTokenAsync(token, Parameters(Key, false));

        Assert.True(result.IsValid);
        var claims = result.ClaimsIdentity;
        Assert.Equal(_user.Id.ToString(), claims.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        Assert.Equal(_user.Email, claims.FindFirst(ClaimTypes.Email)?.Value);
        Assert.Equal("Administrator", claims.FindFirst(ClaimTypes.Role)?.Value);
        Assert.Equal(_user.BusinessUnitId.ToString(), claims.FindFirst(CustomClaim.BusinessUnit)?.Value);
        Assert.Equal(_user.SecurityStamp, claims.FindFirst(CustomClaim.SecurityStamp)?.Value);
    }

    [Fact]
    [Trait("Categoria", "JWT")]
    public void CreateAccessToken_ValidUser_ExpiresAfterConfiguredMinutes()
    {
        var token = new JsonWebToken(NewService(Now).CreateAccessToken(_user, "Administrator"));

        Assert.Equal(Now.ToDateTimeUtc(), token.ValidFrom);
        Assert.Equal(Now.Plus(Duration.FromMinutes(15)).ToDateTimeUtc(), token.ValidTo);
        Assert.Equal("emissor-ficticio", token.Issuer);
        Assert.Contains("audiencia-ficticia", token.Audiences);
    }

    [Fact]
    [Trait("Categoria", "JWT")]
    public async Task CreateAccessToken_IssuedLongAgo_FailsLifetimeValidation()
    {
        var token = NewService(Instant.FromUtc(2020, 1, 1, 0, 0, 0)).CreateAccessToken(_user, "Administrator");

        var result = await new JsonWebTokenHandler().ValidateTokenAsync(token, Parameters(Key, true));

        Assert.False(result.IsValid);
    }

    [Fact]
    [Trait("Categoria", "JWT")]
    public async Task CreateAccessToken_ValidatedWithAnotherKey_IsRejected()
    {
        var token = NewService(Now).CreateAccessToken(_user, "Administrator");

        var result = await new JsonWebTokenHandler()
            .ValidateTokenAsync(token, Parameters("outra-chave-ficticia-com-32-bytes-ou-mais", false));

        Assert.False(result.IsValid);
    }

    [Fact]
    [Trait("Categoria", "JWT")]
    public void CreateRefreshToken_NewToken_HashDiffersFromRawAndMatchesHashToken()
    {
        var service = NewService(Now);

        var (raw, hash) = service.CreateRefreshToken();

        Assert.NotEqual(raw, hash);
        Assert.Equal(64, hash.Length);
        Assert.Equal(service.HashToken(raw), hash);
    }

    [Fact]
    [Trait("Categoria", "JWT")]
    public void CreateRefreshToken_CalledTwice_ProducesDifferentTokens()
    {
        var service = NewService(Now);

        var first = service.CreateRefreshToken();
        var second = service.CreateRefreshToken();

        Assert.NotEqual(first.Raw, second.Raw);
        Assert.NotEqual(first.Hash, second.Hash);
    }

    [Fact]
    [Trait("Categoria", "JWT")]
    public void HashToken_DifferentRawTokens_ProduceDifferentHashes()
    {
        var service = NewService(Now);

        Assert.NotEqual(service.HashToken("token-a"), service.HashToken("token-b"));
        Assert.Equal(service.HashToken("token-a"), service.HashToken("token-a"));
    }
}
