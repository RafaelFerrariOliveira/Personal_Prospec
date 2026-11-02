using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Infra.ORM.Mappings.Base;

namespace PersonalProspec.Infra.ORM.Mappings;

public sealed class UserMapping : BaseMapping<User>
{
    public override void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable(nameof(User), Schema);

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Id)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("id")
            .HasColumnOrder(1)
            .ValueGeneratedOnAdd()
            .IsRequired();

        builder.Property(u => u.Email)
            .HasColumnType("nvarchar(256)")
            .HasColumnName("email")
            .HasColumnOrder(2)
            .IsRequired();

        builder.Property(u => u.NormalizedEmail)
            .HasColumnType("nvarchar(256)")
            .HasColumnName("normalized_email")
            .HasColumnOrder(3)
            .IsRequired();

        builder.Property(u => u.PasswordHash)
            .HasColumnType("varchar(255)")
            .HasColumnName("password_hash")
            .HasColumnOrder(4)
            .IsRequired();

        builder.Property(u => u.SecurityStamp)
            .HasColumnType("varchar(64)")
            .HasColumnName("security_stamp")
            .HasColumnOrder(5)
            .IsRequired();

        builder.Property(u => u.AccessFailedCount)
            .HasColumnType("int")
            .HasColumnName("access_failed_count")
            .HasColumnOrder(6)
            .IsRequired();

        builder.Property(u => u.LockoutEnabled)
            .HasColumnType("bit")
            .HasColumnName("lockout_enabled")
            .HasColumnOrder(7)
            .IsRequired();

        builder.Property(u => u.LockoutEnd)
            .HasColumnType("datetime2")
            .HasColumnName("lockout_end")
            .HasColumnOrder(8)
            .IsRequired(false);

        builder.Property(u => u.RoleId)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("role_id")
            .HasColumnOrder(9)
            .IsRequired();

        builder.Property(u => u.CreatedAt)
            .HasColumnType("datetime2")
            .HasColumnName("created_at")
            .HasColumnOrder(10)
            .IsRequired();

        builder.Property(u => u.BusinessUnitId)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("business_unit_id")
            .HasColumnOrder(11)
            .IsRequired();

        builder.HasIndex(u => u.NormalizedEmail).IsUnique();

        builder.HasOne(u => u.Role)
            .WithMany()
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired();
    }
}
