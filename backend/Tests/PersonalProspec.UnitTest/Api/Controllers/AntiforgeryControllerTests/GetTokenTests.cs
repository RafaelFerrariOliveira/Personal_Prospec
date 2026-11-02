using Microsoft.AspNetCore.Mvc.Routing;
using System.Reflection;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Moq;
using PersonalProspec.Api.Controllers;
using PersonalProspec.Api.Settings.Handlers;

namespace PersonalProspec.UnitTest.Api.Controllers.AntiforgeryControllerTests;

public sealed class GetTokenTests
{
    private static MethodInfo Action => typeof(AntiforgeryController).GetMethod(nameof(AntiforgeryController.GetToken))!;

    [Fact]
    [Trait("Categoria", "Metadata de endpoint")]
    public void GetToken_Metadata_IsAnonymousGetWithRateLimitAndRoute()
    {
        var route = typeof(AntiforgeryController).GetCustomAttribute<RouteAttribute>()!.Template;
        var http = Action.GetCustomAttributes().OfType<HttpMethodAttribute>().Single();

        Assert.Equal("api/[controller]", route);
        Assert.Equal("token", http.Template);
        Assert.Equal("GET", http.HttpMethods.Single());
        Assert.NotNull(Action.GetCustomAttribute<AllowAnonymousAttribute>());
        Assert.Equal(RateLimitingSettings.LimitingByUser, Action.GetCustomAttribute<EnableRateLimitingAttribute>()?.PolicyName);
    }

    [Fact]
    [Trait("Categoria", "Delegação")]
    public void GetToken_Called_ReturnsRequestTokenFromAntiforgery()
    {
        var httpContext = new DefaultHttpContext();
        var antiforgery = new Mock<IAntiforgery>();
        antiforgery
            .Setup(a => a.GetAndStoreTokens(httpContext))
            .Returns(new AntiforgeryTokenSet("token-ficticio", "cookie-ficticio", "campo", "X-CSRF-TOKEN"));
        var controller = new AntiforgeryController(antiforgery.Object)
        {
            ControllerContext = new ControllerContext { HttpContext = httpContext }
        };

        var result = controller.GetToken();

        Assert.Equal("token-ficticio", result.Token);
    }
}
