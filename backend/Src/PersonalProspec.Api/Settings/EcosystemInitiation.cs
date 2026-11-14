using PersonalProspec.Api.Middlewares;
using PersonalProspec.Api.Settings.Handlers;
using Scalar.AspNetCore;

namespace PersonalProspec.Api.Settings;

public static class EcosystemInitiation
{
    public static void AddWebApplication(this WebApplication app, IConfiguration configuration)
    {
        // FR-011: exceção não prevista nunca devolve stack trace nem mensagem da exceção.
        app.UseMiddleware<GlobalExceptionMiddleware>();

        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi().AllowAnonymous();
            app.MapScalarApiReference().AllowAnonymous();
        }

        app.UseHttpsRedirection();

        // Publicação única (front + API no mesmo host): o build do React fica em wwwroot e sai antes dos middlewares da API.
        app.UseDefaultFiles();
        app.UseStaticFiles();

        // Ordem do padrão: o CSRF vem ANTES de CORS, RateLimiter e Authentication.
        app.UseMiddleware<CsrfValidationMiddleware>();
        app.UseCors(CorsSettings.PolicyName);
        app.UseRateLimiter();
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseMiddleware<TenantContextMiddleware>();

        app.MapControllers();
        app.MapHealthChecks("/health").AllowAnonymous();

        // Rotas do React (ex.: /campaigns/new) devolvem o index.html. nonfile deixa arquivos (/assets/*.js) para o
        // UseStaticFiles, que não serve quando já há endpoint escolhido; api/ e health ficam de fora do fallback.
        app.MapFallbackToFile("{*path:nonfile:regex(^(?!api/|health$).*$)}", "index.html").AllowAnonymous();
    }
}
