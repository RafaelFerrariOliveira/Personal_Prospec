using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using NodaTime;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.Domain.Constants;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Domain.Providers;

namespace PersonalProspec.Api.Handlers;

public sealed class JwtTokenService(JwtTokenOptions options, IClock clock) : IJwtTokenService
{
    public string CreateAccessToken(User user, string role)
    {
        var now = clock.GetCurrentInstant();

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, role),
                new Claim(CustomClaim.BusinessUnit, user.BusinessUnitId.ToString()),
                new Claim(CustomClaim.SecurityStamp, user.SecurityStamp)
            ]),
            Issuer = options.Issuer,
            Audience = options.Audience,
            NotBefore = now.ToDateTimeUtc(),
            Expires = now.Plus(Duration.FromMinutes(options.AccessTokenMinutes)).ToDateTimeUtc(),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.JwtKey)),
                SecurityAlgorithms.HmacSha256)
        };

        return new JsonWebTokenHandler().CreateToken(descriptor);
    }

    public (string Raw, string Hash) CreateRefreshToken()
    {
        var raw = Base64UrlEncoder.Encode(RandomNumberGenerator.GetBytes(32));

        return (raw, HashToken(raw));
    }

    public string HashToken(string rawToken) =>
        Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(rawToken)));
}
