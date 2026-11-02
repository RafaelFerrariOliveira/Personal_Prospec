using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.RateLimiting;
using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.Api.Settings.Handlers;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.Domain.UserPolicies;

namespace PersonalProspec.UnitTest.Api.Controllers.ReferenceControllerTests.Base;

public abstract class ReferenceControllerSetup
{
    protected readonly Mock<IReferenceQueryService> QueryService = new();
    protected readonly ReferenceController Controller;

    protected ReferenceControllerSetup()
    {
        Controller = new ReferenceController(QueryService.Object);
    }

    protected static void AssertEndpoint(string actionName, string route)
    {
        var action = typeof(ReferenceController).GetMethod(actionName)
                     ?? throw new InvalidOperationException($"Action {actionName} não encontrada.");
        var http = action.GetCustomAttributes().OfType<HttpMethodAttribute>().Single();

        Assert.Equal(route, http.Template);
        Assert.Equal("GET", http.HttpMethods.Single());
        Assert.Null(action.GetCustomAttribute<AllowAnonymousAttribute>());
        Assert.Equal(Policy.Administrator, action.GetCustomAttribute<AuthorizeAttribute>()?.Roles);
        Assert.Equal(RateLimitingSettings.LimitingByUser, action.GetCustomAttribute<EnableRateLimitingAttribute>()?.PolicyName);
    }
}
