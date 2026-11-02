using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Infra.ORM.Mappings.Base;

namespace PersonalProspec.Infra.ORM.Mappings;

public sealed class MunicipalityMapping : BaseMapping<Municipality>
{
    public override void Configure(EntityTypeBuilder<Municipality> builder)
    {
        builder.ToTable(nameof(Municipality), Schema);

        builder.HasKey(m => m.Code);

        builder.Property(m => m.Code)
            .HasColumnType("char(4)")
            .HasColumnName("code")
            .HasColumnOrder(1)
            .ValueGeneratedNever()
            .IsRequired();

        builder.Property(m => m.State)
            .HasColumnType("char(2)")
            .HasColumnName("state")
            .HasColumnOrder(2)
            .IsRequired();

        // Nome mais longo da fonte: 32 caracteres (maiúsculas e sem acento, como na Receita).
        builder.Property(m => m.Name)
            .HasColumnType("varchar(60)")
            .HasColumnName("name")
            .HasColumnOrder(3)
            .IsRequired();

        builder.HasIndex(m => new { m.State, m.Name });
    }
}
