using Microsoft.AspNetCore.Mvc.Routing;
using System.Reflection;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.Api.Settings.Handlers;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.Domain.Constants;

namespace PersonalProspec.UnitTest.Api.Controllers.AuthenticationControllerTests.Base;

public abstract class AuthenticationControllerSetup
{
    protected readonly Mock<IAuthenticationCommandService> CommandService = new();
    protected readonly Mock<IAuthenticationQueryService> QueryService = new();
    protected readonly Guid UserId = Guid.NewGuid();
    protected readonly Guid BusinessUnitId = Guid.NewGuid();
    protected readonly AuthenticationController Controller;

    protected AuthenticationControllerSetup()
    {
        Controller = new AuthenticationController(CommandService.Object, QueryService.Object)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(
                    [
                        new Claim(ClaimTypes.NameIdentifier, UserId.ToString()),
                        new Claim(CustomClaim.BusinessUnit, BusinessUnitId.ToString())
                    ], "teste"))
                }
            }
        };
    }

    protected static MethodInfo Action(string name) =>
        typeof(AuthenticationController).GetMethod(name)
        ?? throw new InvalidOperationException($"Action {name} não encontrada.");

    protected static string? RouteTemplate(string actionName) =>
        Action(actionName).GetCustomAttributes().OfType<HttpMethodAttribute>().Single().Template;

    protected static string HttpVerb(string actionName) =>
        Action(actionName).GetCustomAttributes().OfType<HttpMethodAttribute>().Single().HttpMethods.Single();

    protected static bool IsAnonymous(string actionName) =>
        Action(actionName).GetCustomAttribute<AllowAnonymousAttribute>() is not null;

    protected static string? AuthorizedRoles(string actionName) =>
        Action(actionName).GetCustomAttribute<AuthorizeAttribute>()?.Roles;

    protected static string? RateLimitPolicy(string actionName) =>
        Action(actionName).GetCustomAttribute<EnableRateLimitingAttribute>()?.PolicyName;

    protected static string ExpectedRateLimitPolicy => RateLimitingSettings.LimitingByUser;

    protected static string ControllerRoute =>
        typeof(AuthenticationController).GetCustomAttribute<RouteAttribute>()!.Template;
}
