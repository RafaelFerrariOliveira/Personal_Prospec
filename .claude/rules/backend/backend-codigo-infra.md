---
paths:
  - "backend/**"
---

<!-- Gerado por .claude/scripts/sync-obsidian-rules.mjs a partir de Obsidian "Claude Memory/backend-codigo-infra.md". Não editar aqui: editar a origem e rodar o script. -->

> Neste projeto: `Projeto` = `PersonalProspec`, `APP` = sigla do schema SQL ([A DEFINIR]). Todo caminho citado é relativo a `backend/`.

**REGRA do [padrao-projeto-csharp](./padrao-projeto-csharp.md):** todo código de Infra segue este código-modelo (abreviado com `// ...`). Camada anterior: [backend-codigo-domain](./backend-codigo-domain.md). Próxima: [backend-codigo-application](./backend-codigo-application.md).

## Base de mapping: `ORM/Mappings/Base/BaseMapping.cs`

```csharp
namespace Projeto.Infra.ORM.Mappings.Base;

public abstract class BaseMapping<T> : IEntityTypeConfiguration<T> where T : class
{
    protected const string Schema = "APP"; // sigla do sistema

    public abstract void Configure(EntityTypeBuilder<T> builder);
}
```

## Mapping: `ORM/Mappings/CustomerMapping.cs`

```csharp
public sealed class CustomerMapping : BaseMapping<Customer>
{
    public override void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable(nameof(Customer), Schema);

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("id")
            .HasColumnOrder(1)
            .ValueGeneratedOnAdd()
            .IsRequired();

        builder.Property(c => c.Document)
            .HasColumnType("varchar(100)")
            .HasColumnName("document")
            .HasColumnOrder(4)
            .IsUnicode()
            .IsRequired();

        builder.Property(c => c.SpecificName)
            .HasColumnType("varchar(255)")
            .HasColumnName("specific_name")
            .HasColumnOrder(6)
            .IsUnicode()
            .IsRequired(false);

        builder.Property(c => c.BusinessUnitId)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("business_unit_id")
            .HasColumnOrder(13)
            .IsRequired();

        builder.HasOne(c => c.Address)
            .WithOne()
            .HasForeignKey<Customer>(c => c.AddressId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired(false);

        builder.HasMany(c => c.Orders)
            .WithOne(o => o.Customer)
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.NoAction);
        // ...
    }
}
```

## Base de repositório: `Repositories/Base/RepositoryBase.cs`

```csharp
public abstract class RepositoryBase<T>(ApplicationContext dbContext) where T : class
{
    protected readonly ApplicationContext DbContext = dbContext;

    protected const int RowsAffected = 1;
    protected DbSet<T> DbSetContext => DbContext.Set<T>();

    protected async Task<bool> SaveInDatabaseAsync() =>
        await DbContext.SaveChangesAsync() >= RowsAffected;
}
```

## Repositório: `Repositories/CustomerRepository.cs`

```csharp
public sealed class CustomerRepository(
    ApplicationContext dbContext,
    IPaginationQueryService<Customer> paginationQueryService)
    : RepositoryBase<Customer>(dbContext), ICustomerRepository
{
    public async Task<bool> SaveAsync(Customer customer)
    {
        await DbSetContext.AddAsync(customer);

        return await SaveInDatabaseAsync();
    }

    public async Task<bool> DeleteAsync(Guid id) =>
        await DbSetContext
            .Where(c => c.Id == id)
            .ExecuteDeleteAsync() == RowsAffected;

    public async Task<Customer?> FindByPredicateAsync(
        Expression<Func<Customer, bool>> predicate,
        Func<IQueryable<Customer>, IIncludableQueryable<Customer, object>>? include = null,
        bool toQuery = false)
    {
        IQueryable<Customer> query = DbSetContext;

        query = query.Where(predicate);

        if (toQuery)
            query = query.AsNoTracking();

        if (include is not null)
            query = include(query);

        return await query.FirstOrDefaultAsync();
    }

    public Task<PageList<Customer>> FindAllWithPaginationAsync(
        CustomerPageParams pageParams,
        Func<IQueryable<Customer>, IIncludableQueryable<Customer, object>>? include = null)
    {
        IQueryable<Customer> query = DbSetContext;

        if (include is not null)
            query = include(query);

        return paginationQueryService.CreatePaginationAsync(
            PaginationFilter(query, pageParams),
            pageParams.PageNumber,
            pageParams.PageSize);
    }

    private static IQueryable<Customer> PaginationFilter(IQueryable<Customer> query, CustomerPageParams pageParams)
    {
        if (pageParams.Name is not null)
            query = query.Where(c => c.Name.Contains(pageParams.Name));

        return query.OrderByDescending(c => c.CreatedAt);
    }

    public async Task<bool> ExistsByPredicateAsync(Expression<Func<Customer, bool>> predicate) =>
        await DbSetContext.AsNoTracking().AnyAsync(predicate);
    // UpdateAsync, FindAllAsync ...
}
```

## Contexto: `ORM/Contexts/ApplicationContext.cs`

```csharp
public sealed class ApplicationContext(
    DbContextOptions<ApplicationContext> options,
    ICurrentTenantContext tenantContext)
    : DbContext(options)
{
    private Guid CurrentBusinessUnitId => tenantContext.BusinessUnitId;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationContext).Assembly);

        base.OnModelCreating(builder);
        ApplyTenantQueryFilters(builder);          // reflection: toda entidade ITenantOwned
        ApplyIndirectTenantQueryFilters(builder);  // entidades sem coluna própria, via navegação
    }

    private void ApplyIndirectTenantQueryFilters(ModelBuilder builder)
    {
        builder.Entity<OrderItem>().HasQueryFilter(i =>
            i.Order!.BusinessUnitId == CurrentBusinessUnitId);
        // ...
    }
}
```

## Unit of Work: `ORM/UoW/UnitOfWork.cs`

```csharp
public sealed class UnitOfWork(ApplicationContext dbContext) : IUnitOfWork
{
    public async Task BeginTransaction()
    {
        await dbContext.Database.BeginTransactionAsync();
    }

    public async Task CommitTransaction()
    {
        try
        {
            await dbContext.Database.CommitTransactionAsync();
        }
        catch
        {
            await RollbackTransaction();
            throw;
        }
    }

    public async Task RollbackTransaction()
    {
        await dbContext.Database.RollbackTransactionAsync();
    }
}
```

## Regras da camada

- `ApplicationContext` é `DbContext` puro (nunca `IdentityDbContext`), configurações via `ApplyConfigurationsFromAssembly`.
- Mapping `sealed` herdando `BaseMapping<T>`; tabela no schema do sistema; cada propriedade com `HasColumnType` + `HasColumnName` (snake_case) + `HasColumnOrder` + `IsRequired`; FK com `DeleteBehavior.NoAction`.
- **Nunca** `HasQueryFilter` no Mapping: tenant direto via `ITenantOwned`, indireto em `ApplyIndirectTenantQueryFilters`; a mesma entidade nunca nas duas listas.
- Repositório `sealed`, herda `RepositoryBase<T>`, implementa a interface do Domain; `FindByPredicateAsync` com `include` e `toQuery` (AsNoTracking); delete/update atômico com `ExecuteDeleteAsync`/`ExecuteUpdateAsync`; `PaginationFilter` privado e estático.
- Migrations: `dotnet ef migrations add <Nome> --project Projeto.Infra --startup-project Projeto.Api` (rodar a partir de `Src/`); `database update` em HML/PRD só com confirmação.
- Connection string vem de `ConnectionStringOptions`, nunca literal: [backend-regra-segredos](./backend-regra-segredos.md).

**Why:** Código-modelo que o Rafael definiu como obrigatório para todo projeto C# (2026-10-19).
**How to apply:** Gerar e revisar Infra a partir deste modelo, trocando `Projeto`, `APP` e as entidades de exemplo. Em projeto existente, conferir o código local antes de gerar.
