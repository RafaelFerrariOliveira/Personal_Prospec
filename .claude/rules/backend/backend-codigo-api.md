---
paths:
  - "backend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/backend-codigo-api.md". Não editar aqui: editar a origem e rodar o script. -->

> Neste projeto: `Projeto` = `PersonalProspec`, `APP` = sigla do schema SQL ([A DEFINIR]). Todo caminho citado é relativo a `backend/`.

**REGRA do [padrao-projeto-csharp](./padrao-projeto-csharp.md):** todo código de Api segue este código-modelo (abreviado com `// ...`). Camada anterior: [backend-codigo-application](./backend-codigo-application.md). Testes: [backend-codigo-testes](./backend-codigo-testes.md).

## Controller: `Controllers/CustomerController.cs`

```csharp
namespace Projeto.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CustomerController(
    ICustomerQueryService customerQueryService,
    ICustomerCommandService customerCommandService)
    : ControllerBase
{
    [Authorize(Roles = $"{Policy.Administrator},{Policy.Manager}")]
    [HttpPost("register_customer")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(IEnumerable<DomainNotification>))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<bool> Register([FromBody] CustomerRegisterRequest request) =>
        customerCommandService.RegisterAsync(request, User.GetBusinessUnitId());

    [HttpGet("get_by_id_customer")]
    [Authorize(Roles = $"{Policy.Administrator},{Policy.Manager}")]
    [EnableRateLimiting(RateLimitingSettings.LimitingByUser)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError, Type = typeof(IEnumerable<DomainNotification>))]
    public Task<CustomerSimpleResponse?> GetById([FromQuery] Guid id) =>
        customerQueryService.GetByIdAsync(id, User.GetBusinessUnitId());
    // update_register_customer, get_all_with_pagination_customer, get_all_customers ...
}
```

## Entrada: `Program.cs`

```csharp
var builder = WebApplication.CreateBuilder(args);
IConfiguration configuration = builder.Configuration;

builder.Services.AddInversionOfControlHandler();
builder.Services.AddSettingsControl(configuration);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHealthChecks();

var app = builder.Build();

app.AddWebApplication(configuration);
await app.MigrateDatabaseAsync();
app.Run();

namespace Projeto.Api
{
    public abstract partial class Program { }   // exposto p/ WebApplicationFactory
}
```

## IoC: `IoC/InversionOfControlHandler.cs` e `IoC/Containers/`

```csharp
public static class InversionOfControlHandler
{
    public static void AddInversionOfControlHandler(this IServiceCollection services)
    {
        services.AddScoped<INotificationHandler, NotificationHandler>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<ILoggerHandler, LoggerHandler>();
        services.AddScoped<ICurrentTenantContext, CurrentTenantContext>();

        services.AddSingleton(DateTimeZoneProviders.Tzdb);
        services.AddSingleton<IClock>(SystemClock.Instance);
        // ...

        services.AddPaginationContainer();
        services.AddRepositoryContainer();
        services.AddServiceContainer();
        services.AddMapperContainer();
        services.AddValidationContainer();
        services.AddAuthenticationContainer();
    }
}

// Registro de uma entidade nova (uma linha em cada container)
services.AddScoped<ICustomerQueryService, CustomerQueryService>();     // ServiceContainer
services.AddScoped<ICustomerCommandService, CustomerCommandService>(); // ServiceContainer
services.AddScoped<ICustomerMapper, CustomerMapper>();                 // MapperContainer
services.AddScoped<IValidate<Customer>, CustomerValidation>();         // ValidationContainer
services.AddScoped<ICustomerRepository, CustomerRepository>();         // RepositoryContainer
```

## Filtros: `Filters/NotificationFilter.cs` e `Filters/UnitOfWorkFilter.cs`

```csharp
public sealed class NotificationFilter(INotificationHandler notification) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var executedContext = await next();

        if (!notification.HasNotification())
            return;

        var notifications = notification.GetNotifications();

        executedContext.Result = notifications.Any(n => n.Key == CustomClaim.BusinessUnit)
            ? new ObjectResult(notifications) { StatusCode = StatusCodes.Status403Forbidden }
            : new BadRequestObjectResult(notifications);
    }
}

public sealed class UnitOfWorkFilter(IUnitOfWork unitOfWork, INotificationHandler notification)
    : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (context.HttpContext.IsMethodGet())
        {
            await next();
            return;
        }

        await unitOfWork.BeginTransaction();

        try
        {
            var executedContext = await next();
            var routeName = context.GetEndPointName();

            if (IsAuthenticationEndPoint(routeName))
                await LoginMethod(executedContext);   // exceção deliberada: não olha notification (lockout)
            else
                await OthersMethods(executedContext); // commit só sem exception e sem notification
        }
        catch
        {
            await unitOfWork.RollbackTransaction();
            throw;
        }
    }
    // LoginMethod, OthersMethods, SuccessFlow, IsAuthenticationEndPoint ...
}
```

## Regras da camada

- Controller `sealed`, `[ApiController]`, `[Route("api/[controller]")]`, primary constructor com os services (Query e Command).
- Cada action: `[Authorize(Roles = ...)]` com constantes `Policy.*`, `[EnableRateLimiting(RateLimitingSettings.LimitingByUser)]`, rota `snake_case` (`verbo_entidade`), `[ProducesResponseType]` para 200/400/401/403/500.
- Expression body, zero lógica: só repassa ao service com `User.GetBusinessUnitId()`.
- Erro sai pelo `NotificationFilter` (400, ou 403 com chave de tenant); transação pelo `UnitOfWorkFilter` (GET não abre transação).
- Todo registro de DI em `IoC/Containers/`, `AddScoped` por padrão.
- Configuração via Options em `Settings/Handlers/` (segredos: [backend-regra-segredos](./backend-regra-segredos.md)); documentação de API com Scalar, nunca Swashbuckle.
- Tokens só em cookie e CSRF por middleware: [backend-seguranca-identity](./backend-seguranca-identity.md).

**Why:** Código-modelo que o Rafael definiu como obrigatório para todo projeto C# (2026-10-19).
**How to apply:** Gerar e revisar controllers, filtros e IoC a partir deste modelo, trocando `Projeto`, roles e entidades de exemplo. Em projeto existente, conferir o código local antes de gerar.
