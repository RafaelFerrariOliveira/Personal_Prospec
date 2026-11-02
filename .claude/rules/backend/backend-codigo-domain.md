---
paths:
  - "backend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/backend-codigo-domain.md". Não editar aqui: editar a origem e rodar o script. -->

> Neste projeto: `Projeto` = `PersonalProspec`, `APP` = sigla do schema SQL ([A DEFINIR]). Todo caminho citado é relativo a `backend/`.

**REGRA do [padrao-projeto-csharp](./padrao-projeto-csharp.md):** todo código de Domain segue este código-modelo (entidade de exemplo `Customer`, trechos abreviados com `// ...`). Estrutura: [backend-estrutura-pastas](./backend-estrutura-pastas.md). Próxima camada: [backend-codigo-infra](./backend-codigo-infra.md).

## Entidade: `Entities/Customer.cs`

```csharp
namespace Projeto.Domain.Entities;

public sealed class Customer : ITenantOwned
{
    public Guid Id { get; init; }
    public EPurpose Purpose { get; set; }
    public DateTime CreatedAt { get; init; }
    public required string Document { get; set; } // CPF ou CNPJ
    public required string Name { get; set; }
    public string? SpecificName { get; set; }
    public required string Email { get; set; }
    public string? Phone { get; set; }
    // ...

    public Guid BusinessUnitId { get; init; }
    public long? AddressId { get; set; }
    public Address? Address { get; set; }
    public List<Order> Orders { get; set; } = [];
}
```

## Tenant: `Interfaces/ITenantOwned.cs`

```csharp
namespace Projeto.Domain.Interfaces;

public interface ITenantOwned
{
    Guid BusinessUnitId { get; }
}
```

## Validação: `EntitiesValidation/CustomerValidation.cs`

```csharp
public sealed class CustomerValidation : Validate<Customer>
{
    public CustomerValidation()
    {
        SetRules();
    }

    private void SetRules()
    {
        RuleFor(c => c.Document)
            .NotEmpty()
            .WithMessage(EMessage.Required.GetDescription().FormatTo("Documento"))
            .MaximumLength(50)
            .WithMessage(EMessage.MoreExpected.GetDescription().FormatTo("Documento", "até 50"))
            .Must((c, document) => c.Purpose == EPurpose.Personal
                ? CpfValidation.Validate(document)
                : CnpjValidation.Validate(document))
            .WithMessage(EMessage.InvalidFormat.GetDescription().FormatTo("Documento"))
            .When(c => !string.IsNullOrWhiteSpace(c.Document), ApplyConditionTo.CurrentValidator);

        RuleFor(c => c.Email)
            .NotEmpty()
            .WithMessage(EMessage.Required.GetDescription().FormatTo("E-mail"))
            .EmailFormat();

        RuleFor(c => c.ResponsibleParty!)
            .SetValidator(new ResponsiblePartyValidation())
            .When(c => c.ResponsibleParty is not null && c.Purpose == EPurpose.Professional);
        // ...
    }
}
```

## Base de validação: `Handlers/ValidationSettings/Validate.cs`

```csharp
public abstract class Validate<T> : AbstractValidator<T>, IValidate<T>
{
    public async Task<ValidationResponse> ValidationAsync(T entity)
    {
        var result = await ValidateAsync(entity);
        return new ValidationResponse(result.IsValid, ToValidationDictionary(result.Errors));
    }

    // Validation(T) síncrono + ToValidationDictionary: agrupa mensagens por PropertyName
}
```

## Contrato de repositório: `Interfaces/RepositoryContracts/ICustomerRepository.cs`

```csharp
public interface ICustomerRepository
{
    Task<bool> SaveAsync(Customer customer);
    Task<bool> UpdateAsync(Customer customer);
    Task<bool> DeleteAsync(Guid id);

    Task<Customer?> FindByPredicateAsync(
        Expression<Func<Customer, bool>> predicate,
        Func<IQueryable<Customer>, IIncludableQueryable<Customer, object>>? include = null,
        bool toQuery = false);

    Task<PageList<Customer>> FindAllWithPaginationAsync(
        CustomerPageParams pageParams,
        Func<IQueryable<Customer>, IIncludableQueryable<Customer, object>>? include = null);

    Task<List<Customer>> FindAllAsync(Guid businessUnitId);

    Task<bool> ExistsByPredicateAsync(Expression<Func<Customer, bool>> predicate);
}
```

## Filtro de paginação: `Handlers/PaginationSettings/Filters/CustomerPageParams.cs`

```csharp
public sealed class CustomerPageParams : PageParams
{
    public string? Name { get; init; }
    public DateTime? CreatedAt { get; init; }
}
// PageParams (base): PageNumber = 1, PageSize = 10, limitado a MaxPageSize = 30
```

## Regras da camada

- Entidade `sealed`, anêmica (sem método, sem validação interna); `init` em Id, data de criação e `BusinessUnitId`; `set` no resto; `required` nos obrigatórios; navegação única com `?`; coleção inicializada com `[]`.
- Entidade com dono de tenant implementa `ITenantOwned` (o filtro global vem do `ApplicationContext`).
- Validação herda `Validate<T>`, regras em `SetRules()`, mensagens só via `EMessage...FormatTo(...)`; condicionais com `.When`, customizadas com `.Must`.
- Interface de repositório é a única parte do Domain que pode usar tipos do EF Core (`IIncludableQueryable`).
- Domain não referencia Infra, ApplicationService nem Api (ArchUnitNET valida).

**Why:** Código-modelo que o Rafael definiu como obrigatório para todo projeto C# (2026-10-19).
**How to apply:** Gerar e revisar código de Domain a partir deste modelo, trocando `Projeto` e as entidades de exemplo. Em projeto existente, conferir o código local antes de gerar e apontar divergências.
