using System.Linq.Expressions;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using PersonalProspec.Domain.Interfaces;
using PersonalProspec.Infra.ORM.Converters;

namespace PersonalProspec.Infra.ORM.Contexts;

public sealed class ApplicationContext(
    DbContextOptions<ApplicationContext> options,
    ICurrentTenantContext tenantContext)
    : DbContext(options)
{
    private Guid CurrentBusinessUnitId => tenantContext.BusinessUnitId;

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<Instant>().HaveConversion<InstantConverter>();
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationContext).Assembly);

        base.OnModelCreating(builder);
        ApplyTenantQueryFilters(builder);
        ApplyIndirectTenantQueryFilters(builder);
    }

    // Toda entidade ITenantOwned recebe o filtro e => e.BusinessUnitId == CurrentBusinessUnitId.
    private void ApplyTenantQueryFilters(ModelBuilder builder)
    {
        var contextInstance = Expression.Constant(this);
        var currentBusinessUnitIdProperty = typeof(ApplicationContext)
            .GetProperty(nameof(CurrentBusinessUnitId), BindingFlags.Instance | BindingFlags.NonPublic)!;

        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (!typeof(ITenantOwned).IsAssignableFrom(entityType.ClrType))
                continue;

            var entityParameter = Expression.Parameter(entityType.ClrType, "e");
            var entityBusinessUnitId = Expression.Property(entityParameter, nameof(ITenantOwned.BusinessUnitId));
            var currentBusinessUnitId = Expression.Property(contextInstance, currentBusinessUnitIdProperty);
            var filterBody = Expression.Equal(entityBusinessUnitId, currentBusinessUnitId);
            var filterLambda = Expression.Lambda(filterBody, entityParameter);

            builder.Entity(entityType.ClrType).HasQueryFilter(filterLambda);
        }
    }

    // Entidades sem coluna BusinessUnitId própria, filtradas pela navegação até o dono do tenant.
    // Nunca repetir aqui uma entidade ITenantOwned: o segundo filtro substitui o primeiro.
    private void ApplyIndirectTenantQueryFilters(ModelBuilder builder)
    {
        // Exemplo: builder.Entity<OrderItem>().HasQueryFilter(i => i.Order!.BusinessUnitId == CurrentBusinessUnitId);
    }
}
