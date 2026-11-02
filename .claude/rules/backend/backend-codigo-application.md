---
paths:
  - "backend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/backend-codigo-application.md". Não editar aqui: editar a origem e rodar o script. -->

> Neste projeto: `Projeto` = `PersonalProspec`, `APP` = sigla do schema SQL ([A DEFINIR]). Todo caminho citado é relativo a `backend/`.

**REGRA do [padrao-projeto-csharp](./padrao-projeto-csharp.md):** todo código de ApplicationService segue este código-modelo (abreviado com `// ...`). Camada anterior: [backend-codigo-infra](./backend-codigo-infra.md). Próxima: [backend-codigo-api](./backend-codigo-api.md).

## Base: `Services/ServiceBase.cs`

```csharp
namespace Projeto.ApplicationService.Services;

public abstract class ServiceBase(INotificationHandler notification, ILoggerHandler loggerHandler)
{
    protected readonly INotificationHandler Notification = notification;

    protected async Task<bool> EntityValidationAsync<T>(IValidate<T> validate, T entity)
    {
        var response = await validate.ValidationAsync(entity);

        if (!response.IsValid)
        {
            foreach (var error in response.Errors)
            foreach (var message in error.Value)
                Notification.CreateNotification(error.Key, message);

            return false;
        }

        return true;
    }

    protected void GenerateLogger(DomainLogger logger)
    {
        loggerHandler.CreateLogger(logger);
    }
}
```

## Escrita: `Services/CustomerServices/CustomerCommandService.cs`

```csharp
public sealed class CustomerCommandService(
    INotificationHandler notification,
    ILoggerHandler loggerHandler,
    ICustomerRepository customerRepository,
    ICustomerMapper customerMapper,
    IValidate<Customer> customerValidate)
    : ServiceBase(notification, loggerHandler), ICustomerCommandService
{
    public async Task<bool> RegisterAsync(CustomerRegisterRequest request, Guid businessUnitId)
    {
        if (await ExistDocumentAsync(null, request.Document, CustomerTrace.Save))
            return false;

        var customer = customerMapper.DtoRegisterToDomain(request, businessUnitId);

        if (!await EntityValidationAsync(customerValidate, customer))
            return false;

        return await customerRepository.SaveAsync(customer);
    }

    public async Task<bool> UpdateRegisterAsync(CustomerUpdateRequest request, Guid businessUnitId)
    {
        var customer = await customerRepository.FindByPredicateAsync(
            c => c.Id == request.Id && c.BusinessUnitId == businessUnitId,
            query => query.Include(c => c.Address!)
                .Include(c => c.ResponsibleParty!));

        if (customer is null)
            return Notification.CreateNotification(
                CustomerTrace.Update,
                EMessage.NotFound.GetDescription().FormatTo("Cliente"));

        customer = customerMapper.DtoUpdateToDomain(customer, request);

        if (!await EntityValidationAsync(customerValidate, customer))
            return false;

        return await customerRepository.UpdateAsync(customer);
    }
    // ExistDocumentAsync: ExistsByPredicateAsync + Notification EMessage.Exist
}
```

## Leitura: `Services/CustomerServices/CustomerQueryService.cs`

```csharp
public sealed class CustomerQueryService(
    ICustomerRepository customerRepository,
    ICustomerMapper customerMapper)
    : ICustomerQueryService
{
    public async Task<CustomerSimpleResponse?> GetByIdAsync(Guid id, Guid businessUnitId)
    {
        var customer = await customerRepository.FindByPredicateAsync(
            c => c.Id == id && c.BusinessUnitId == businessUnitId,
            query => query
                .Include(c => c.Address!)
                .Include(c => c.ResponsibleParty!)
        );

        if (customer is not null)
            return customerMapper.DomainToSimpleResponse(customer);

        return null;
    }

    public async Task<PageList<CustomerPaginationResponse>> FindAllWithPaginationAsync(
        CustomerPageParams pageParams,
        Guid businessUnitId)
    {
        var customers = await customerRepository.FindAllWithPaginationAsync(
            pageParams,
            query => query
                .Where(c => c.BusinessUnitId == businessUnitId)
                .Include(c => c.Orders));

        return customerMapper.DomainToPaginationResponse(customers);
    }
    // GetAllCustomersAsync ...
}
```

## Mapper: `Mappers/CustomerMapper.cs`

```csharp
public sealed class CustomerMapper(
    IAddressMapper addressMapper,
    IResponsiblePartyMapper responsiblePartyMapper)
    : ICustomerMapper
{
    public Customer DtoRegisterToDomain(CustomerRegisterRequest dto, Guid businessUnitId) =>
        new()
        {
            Purpose = dto.Purpose,
            CreatedAt = DateTimeExtension.GetDateAndTimeInBrasilia(),
            Document = dto.Document.RemoveAlphaNumeric(),
            Name = dto.Name,
            Email = dto.Email,
            BusinessUnitId = businessUnitId,
            Address = dto.Address is not null ? addressMapper.MergeToDomain(null, dto.Address) : null,
            // ...
        };

    public Customer DtoUpdateToDomain(Customer customer, CustomerUpdateRequest dto)
    {
        customer.Purpose = dto.Purpose;
        customer.Document = dto.Document.RemoveAlphaNumeric();
        customer.Name = dto.Name;
        // ...

        return customer;
    }

    public PageList<CustomerPaginationResponse> DomainToPaginationResponse(PageList<Customer> customers)
    {
        var items = customers.Items.Select(SingleDomainToPaginationResponse).ToList();

        return new PageList<CustomerPaginationResponse>(
            items, customers.TotalCount, customers.PageNumber, customers.PageSize);
    }

    private static CustomerPaginationResponse SingleDomainToPaginationResponse(Customer c) =>
        new()
        {
            Id = c.Id,
            Name = c.Name,
            OrderQuantity = c.Orders.Count
            // ...
        };
}
```

## DTOs: `Dtos/CustomerDtos/Request` e `Response`

```csharp
public sealed record CustomerRegisterRequest
{
    public EPurpose Purpose { get; set; }
    public required string Document { get; set; }
    public required string Name { get; set; }
    public string? SpecificName { get; set; }
    public AddressRegisterRequest? Address { get; set; }
    // ...
}

public sealed record CustomerSimpleResponse
{
    public Guid Id { get; init; }
    public required string Document { get; init; }
    public required string Name { get; init; }
    public AddressSimpleResponse? Address { get; init; }
    // ...
}
```

## Trace e contratos

```csharp
public static class CustomerTrace
{
    public const string Save = "Cadastro de Cliente";
    public const string Update = "Atualização de Cliente";
}

public interface ICustomerCommandService
{
    Task<bool> RegisterAsync(CustomerRegisterRequest request, Guid businessUnitId);
    Task<bool> UpdateRegisterAsync(CustomerUpdateRequest request, Guid businessUnitId);
}
```

## Regras da camada

- Command herda `ServiceBase` e devolve `bool`; erro de negócio vira notification (`Notification.CreateNotification(XxxTrace.Chave, EMessage...FormatTo(...))`), nunca exceção.
- Fluxo do Command: guard clauses → mapper → `EntityValidationAsync(validate, entity)` → repositório.
- Query não herda `ServiceBase`; devolve DTO de resposta ou `null` (mesma resposta para "não existe" e "outro tenant").
- `businessUnitId` chega por parâmetro (vem do controller) e entra no predicado também, além do filtro global do contexto (defesa em profundidade).
- Mapper manual, `sealed`, sub-mappers injetados; `DtoUpdateToDomain` muta e devolve a entidade; métodos privados `Single...`; normalização (`RemoveAlphaNumeric()`) no mapper.
- Datas por helper central (`DateTimeExtension.GetDateAndTimeInBrasilia()`) ou `IClock` injetado; nunca `DateTime.Now` espalhado (recomendação: `IClock` em código novo, por ser testável).
- DTO é `sealed record`: Request com `set`, Response com `init`.
- `XxxTrace` é `static class` com `const string`, usada como chave de notification e log.
- Sem MediatR e sem AutoMapper.

**Why:** Código-modelo que o Rafael definiu como obrigatório para todo projeto C# (2026-10-19).
**How to apply:** Gerar e revisar services, mappers e DTOs a partir deste modelo, trocando `Projeto` e as entidades de exemplo. Em projeto existente, conferir o código local antes de gerar.
