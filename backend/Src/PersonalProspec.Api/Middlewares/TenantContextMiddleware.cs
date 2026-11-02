using PersonalProspec.Api.Extensions;
using PersonalProspec.Domain.Interfaces;

namespace PersonalProspec.Api.Middlewares;

// Preenche o ICurrentTenantContext com o claim BusinessUnit. O contexto é scoped, por isso entra no
// InvokeAsync e não no construtor. Sem claim (rota anônima), o contexto fica vazio.
public sealed class TenantContextMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, ICurrentTenantContext tenantContext)
    {
        var businessUnitId = context.User.GetBusinessUnitId();

        if (businessUnitId != Guid.Empty)
            tenantContext.SetBusinessUnitId(businessUnitId);

        await next(context);
    }
}
