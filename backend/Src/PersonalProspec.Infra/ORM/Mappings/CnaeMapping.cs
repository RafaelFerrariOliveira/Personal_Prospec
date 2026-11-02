using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Infra.ORM.Mappings.Base;

namespace PersonalProspec.Infra.ORM.Mappings;

public sealed class CnaeMapping : BaseMapping<Cnae>
{
    public override void Configure(EntityTypeBuilder<Cnae> builder)
    {
        builder.ToTable(nameof(Cnae), Schema);

        builder.HasKey(c => c.Code);

        builder.Property(c => c.Code)
            .HasColumnType("varchar(7)")
            .HasColumnName("code")
            .HasColumnOrder(1)
            .ValueGeneratedNever()
            .IsRequired();

        // Descrição mais longa da fonte: 159 caracteres.
        builder.Property(c => c.Description)
            .HasColumnType("nvarchar(200)")
            .HasColumnName("description")
            .HasColumnOrder(2)
            .IsRequired();
    }
}
