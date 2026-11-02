using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using PersonalProspec.Api.Handlers;
using PersonalProspec.Domain.Constants;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Domain.Providers;

namespace PersonalProspec.Api.Settings.Handlers;

public static class AuthenticationSettings
{
    public static void AddAuthenticationSettings(this IServiceCollection services)
    {
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();

        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<JwtTokenOptions>((options, jwt) =>
            {
                // Claims ficam com o tipo emitido (ClaimTypes.*), sem remapeamento.
                options.MapInboundClaims = false;

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwt.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwt.Audience,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.JwtKey)),
                    ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
                    ClockSkew = TimeSpan.Zero,
                    NameClaimType = ClaimTypes.Email,
                    RoleClaimType = ClaimTypes.Role
                };

                options.Events = new JwtBearerEvents
                {
                    // O token só viaja em cookie HttpOnly; nunca em header lido pelo JavaScript.
                    OnMessageReceived = context =>
                    {
                        context.Token = context.Request.Cookies[AuthCookieHandler.AccessCookieName];
                        return Task.CompletedTask;
                    },

                    // Invalida o access token quando a senha muda (FR-007): o SecurityStamp do claim
                    // precisa ser o mesmo do usuário no banco.
                    OnTokenValidated = async context =>
                    {
                        var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<User>>();
                        var userId = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                        var stamp = context.Principal?.FindFirstValue(CustomClaim.SecurityStamp);
                        var businessUnit = context.Principal?.FindFirstValue(CustomClaim.BusinessUnit);

                        var user = userId is null ? null : await userManager.FindByIdAsync(userId);

                        if (user is null
                            || stamp is null
                            || !string.Equals(user.SecurityStamp, stamp, StringComparison.Ordinal)
                            || !string.Equals(user.BusinessUnitId.ToString(), businessUnit, StringComparison.OrdinalIgnoreCase))
                        {
                            context.Fail("Sessão inválida.");
                        }
                    }
                };
            });
    }
}
