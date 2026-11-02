using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace PersonalProspec.Infra.ORM.Mappings.Base;

public abstract class BaseMapping<T> : IEntityTypeConfiguration<T> where T : class
{
    protected const string Schema = "APP"; // sigla do schema SQL do sistema (D7: mantida APP, 2026-11-02)

    public abstract void Configure(EntityTypeBuilder<T> builder);
}
