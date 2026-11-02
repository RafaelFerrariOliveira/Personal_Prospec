using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Infra.ORM.Mappings.Base;

namespace PersonalProspec.Infra.ORM.Mappings;

public sealed class RoleMapping : BaseMapping<Role>
{
    public override void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable(nameof(Role), Schema);

        builder.HasKey(r => r.Id);

        builder.Property(r => r.Id)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("id")
            .HasColumnOrder(1)
            .ValueGeneratedOnAdd()
            .IsRequired();

        builder.Property(r => r.Name)
            .HasColumnType("nvarchar(100)")
            .HasColumnName("name")
            .HasColumnOrder(2)
            .IsRequired();

        builder.Property(r => r.NormalizedName)
            .HasColumnType("nvarchar(100)")
            .HasColumnName("normalized_name")
            .HasColumnOrder(3)
            .IsRequired();

        builder.HasIndex(r => r.NormalizedName).IsUnique();
    }
}
