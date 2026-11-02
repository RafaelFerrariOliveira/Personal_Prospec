using System.Reflection;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.RateLimiting;
using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.Api.Settings.Handlers;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.Domain.Constants;
using PersonalProspec.Domain.UserPolicies;

namespace PersonalProspec.UnitTest.Api.Controllers.CampaignControllerTests.Base;

public abstract class CampaignControllerSetup
{
    protected readonly Mock<ICampaignCommandService> CommandService = new();
    protected readonly Mock<ICampaignQueryService> QueryService = new();
    protected readonly Guid BusinessUnitId = Guid.NewGuid();
    protected readonly CampaignController Controller;

    protected CampaignControllerSetup()
    {
        Controller = new CampaignController(CommandService.Object, QueryService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(
                    [
                        new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                        new Claim(CustomClaim.BusinessUnit, BusinessUnitId.ToString())
                    ], "teste"))
                }
            }
        };
    }

    // Verifica a metadata de segurança e de rota de uma action (enforcement real: teste de integração).
    protected static void AssertEndpoint(string actionName, string route, string verb)
    {
        var action = typeof(CampaignController).GetMethod(actionName)
                     ?? throw new InvalidOperationException($"Action {actionName} não encontrada.");
        var http = action.GetCustomAttributes().OfType<HttpMethodAttribute>().Single();

        Assert.Equal(route, http.Template);
        Assert.Equal(verb, http.HttpMethods.Single());
        Assert.Null(action.GetCustomAttribute<AllowAnonymousAttribute>());
        Assert.Equal(Policy.Administrator, action.GetCustomAttribute<AuthorizeAttribute>()?.Roles);
        Assert.Equal(RateLimitingSettings.LimitingByUser, action.GetCustomAttribute<EnableRateLimitingAttribute>()?.PolicyName);
    }

    protected static string ControllerRoute =>
        typeof(CampaignController).GetCustomAttribute<RouteAttribute>()!.Template;
}
