using Microsoft.Extensions.DependencyInjection;
using System.Text;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Moq;
using PersonalProspec.Api.Middlewares;
using PersonalProspec.Domain.Extensions;
using PersonalProspec.Domain.Handlers.NotificationSettings;

namespace PersonalProspec.UnitTest.Api.Middlewares;

public sealed class CsrfValidationMiddlewareTests
{
    private readonly Mock<IAntiforgery> _antiforgery = new();
    private bool _nextCalled;

    private CsrfValidationMiddleware NewMiddleware() =>
        new(_ =>
        {
            _nextCalled = true;
            return Task.CompletedTask;
        });

    private static DefaultHttpContext NewContext(string method, bool anonymousEndpoint = false)
    {
        var context = new DefaultHttpContext { RequestServices = new ServiceCollection().BuildServiceProvider() };
        context.Request.Method = method;
        context.Response.Body = new MemoryStream();

        if (anonymousEndpoint)
            context.SetEndpoint(new Endpoint(null, new EndpointMetadataCollection(new AllowAnonymousAttribute()), "anonimo"));

        return context;
    }

    private static string ReadBody(HttpContext context) =>
        Encoding.UTF8.GetString(((MemoryStream)context.Response.Body).ToArray());

    [Theory]
    [Trait("Categoria", "CSRF")]
    [InlineData("GET")]
    [InlineData("HEAD")]
    [InlineData("OPTIONS")]
    [InlineData("TRACE")]
    public async Task InvokeAsync_SafeMethod_PassesWithoutValidatingToken(string method)
    {
        var context = NewContext(method);

        await NewMiddleware().InvokeAsync(context, _antiforgery.Object);

        Assert.True(_nextCalled);
        _antiforgery.Verify(a => a.ValidateRequestAsync(It.IsAny<HttpContext>()), Times.Never);
    }

    [Theory]
    [Trait("Categoria", "CSRF")]
    [InlineData("POST")]
    [InlineData("PUT")]
    [InlineData("DELETE")]
    public async Task InvokeAsync_WriteMethodWithoutToken_ReturnsBadRequestWithoutTechnicalDetail(string method)
    {
        var context = NewContext(method);
        _antiforgery
            .Setup(a => a.ValidateRequestAsync(context))
            .ThrowsAsync(new AntiforgeryValidationException("detalhe-tecnico-interno"));

        await NewMiddleware().InvokeAsync(context, _antiforgery.Object);

        var body = ReadBody(context);
        Assert.Equal(StatusCodes.Status400BadRequest, context.Response.StatusCode);
        Assert.False(_nextCalled);
        Assert.Contains(EMessage.InvalidRequest.GetDescription(), body);
        Assert.DoesNotContain("detalhe-tecnico-interno", body);
    }

    [Fact]
    [Trait("Categoria", "CSRF")]
    public async Task InvokeAsync_PostWithValidToken_Passes()
    {
        var context = NewContext("POST");
        _antiforgery.Setup(a => a.ValidateRequestAsync(context)).Returns(Task.CompletedTask);

        await NewMiddleware().InvokeAsync(context, _antiforgery.Object);

        Assert.True(_nextCalled);
        Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode);
        _antiforgery.Verify(a => a.ValidateRequestAsync(context), Times.Once);
    }

    [Fact]
    [Trait("Categoria", "CSRF")]
    public async Task InvokeAsync_PostOnAllowAnonymousEndpoint_PassesWithoutValidatingToken()
    {
        var context = NewContext("POST", anonymousEndpoint: true);

        await NewMiddleware().InvokeAsync(context, _antiforgery.Object);

        Assert.True(_nextCalled);
        _antiforgery.Verify(a => a.ValidateRequestAsync(It.IsAny<HttpContext>()), Times.Never);
    }
}
