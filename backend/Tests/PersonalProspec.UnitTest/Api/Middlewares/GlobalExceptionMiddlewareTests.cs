using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Logging;
using PersonalProspec.Api.Middlewares;
using PersonalProspec.Domain.Extensions;
using PersonalProspec.Domain.Handlers.NotificationSettings;
using PersonalProspec.UnitTest.TestTools;

namespace PersonalProspec.UnitTest.Api.Middlewares;

public sealed class GlobalExceptionMiddlewareTests
{
    private const string SecretMessage = "mensagem-interna-sigilosa";
    private const string RequestBody = "{\"password\":\"corpo-da-requisicao-ficticio\"}";

    private readonly ListLogger<GlobalExceptionMiddleware> _logger = new();

    private GlobalExceptionMiddleware NewMiddleware(RequestDelegate next) => new(next, _logger);

    private static DefaultHttpContext NewContext()
    {
        var context = new DefaultHttpContext { RequestServices = new ServiceCollection().BuildServiceProvider() };
        context.Request.Method = "POST";
        context.Request.Path = "/api/Teste/acao";
        context.Request.Body = new MemoryStream(Encoding.UTF8.GetBytes(RequestBody));
        context.Response.Body = new MemoryStream();
        return context;
    }

    private static string ReadBody(HttpContext context) =>
        Encoding.UTF8.GetString(((MemoryStream)context.Response.Body).ToArray());

    private static Task Throw(HttpContext _) => throw new InvalidOperationException(SecretMessage);

    [Fact]
    [Trait("Categoria", "Exceção global")]
    public async Task InvokeAsync_ConcurrencyException_Returns409WithGenericMessage()
    {
        var context = NewContext();

        await NewMiddleware(_ => throw new DbUpdateConcurrencyException(SecretMessage)).InvokeAsync(context);

        var body = ReadBody(context);
        Assert.Equal(StatusCodes.Status409Conflict, context.Response.StatusCode);
        Assert.Contains(EMessage.ConcurrencyConflict.GetDescription(), body);
        Assert.DoesNotContain(SecretMessage, body);
    }

    [Fact]
    [Trait("Categoria", "Exceção global")]
    public async Task InvokeAsync_UnhandledException_ReturnsGeneric500()
    {
        var context = NewContext();

        await NewMiddleware(Throw).InvokeAsync(context);

        Assert.Equal(StatusCodes.Status500InternalServerError, context.Response.StatusCode);
        Assert.Contains(EMessage.UnexpectedError.GetDescription(), ReadBody(context));
    }

    [Fact]
    [Trait("Categoria", "Exceção global")]
    public async Task InvokeAsync_UnhandledException_DoesNotLeakTextOrStackTrace()
    {
        var context = NewContext();

        await NewMiddleware(Throw).InvokeAsync(context);

        var body = ReadBody(context);
        Assert.DoesNotContain(SecretMessage, body);
        Assert.DoesNotContain(nameof(InvalidOperationException), body);
        Assert.DoesNotContain("   at ", body);
        Assert.DoesNotContain(nameof(GlobalExceptionMiddlewareTests), body);
    }

    [Fact]
    [Trait("Categoria", "Exceção global")]
    public async Task InvokeAsync_UnhandledException_LogsTypeRouteAndCorrelationIdWithoutRequestBody()
    {
        var context = NewContext();
        context.Request.Headers["X-Correlation-Id"] = "corr-ficticio-1";

        await NewMiddleware(Throw).InvokeAsync(context);

        var entry = Assert.Single(_logger.Entries);
        Assert.Equal(LogLevel.Error, entry.Level);
        Assert.Contains(nameof(InvalidOperationException), entry.Message);
        Assert.Contains("/api/Teste/acao", entry.Message);
        Assert.Contains("corr-ficticio-1", entry.Message);
        Assert.DoesNotContain("corpo-da-requisicao-ficticio", entry.Message);
        Assert.DoesNotContain(SecretMessage, entry.Message);
    }

    [Fact]
    [Trait("Categoria", "Exceção global")]
    public async Task InvokeAsync_NoException_PassesThroughUntouched()
    {
        var context = NewContext();

        await NewMiddleware(_ => Task.CompletedTask).InvokeAsync(context);

        Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode);
        Assert.Empty(_logger.Entries);
    }

    [Fact]
    [Trait("Categoria", "Exceção global")]
    public async Task InvokeAsync_ResponseAlreadyStarted_RethrowsOriginalException()
    {
        var context = NewContext();
        context.Features.Set<IHttpResponseFeature>(new StartedResponseFeature());

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => NewMiddleware(Throw).InvokeAsync(context));

        Assert.Equal(SecretMessage, exception.Message);
    }

    private sealed class StartedResponseFeature : HttpResponseFeature
    {
        public override bool HasStarted => true;
    }
}
