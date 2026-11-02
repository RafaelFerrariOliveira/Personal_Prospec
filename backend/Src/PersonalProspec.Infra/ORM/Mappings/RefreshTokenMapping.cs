using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Infra.ORM.Mappings.Base;

namespace PersonalProspec.Infra.ORM.Mappings;

public sealed class RefreshTokenMapping : BaseMapping<RefreshToken>
{
    public override void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable(nameof(RefreshToken), Schema);

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("id")
            .HasColumnOrder(1)
            .ValueGeneratedOnAdd()
            .IsRequired();

        builder.Property(t => t.UserId)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("user_id")
            .HasColumnOrder(2)
            .IsRequired();

        // SHA-256 em hexadecimal: 64 caracteres. O valor cru nunca é gravado.
        builder.Property(t => t.TokenHash)
            .HasColumnType("varchar(64)")
            .HasColumnName("token_hash")
            .HasColumnOrder(3)
            .IsRequired();

        builder.Property(t => t.ExpiresAt)
            .HasColumnType("datetime2")
            .HasColumnName("expires_at")
            .HasColumnOrder(4)
            .IsRequired();

        builder.Property(t => t.RevokedAt)
            .HasColumnType("datetime2")
            .HasColumnName("revoked_at")
            .HasColumnOrder(5)
            .IsRequired(false);

        builder.Property(t => t.CreatedAt)
            .HasColumnType("datetime2")
            .HasColumnName("created_at")
            .HasColumnOrder(6)
            .IsRequired();

        builder.Property(t => t.BusinessUnitId)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("business_unit_id")
            .HasColumnOrder(7)
            .IsRequired();

        builder.HasIndex(t => t.TokenHash).IsUnique();

        builder.HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.NoAction)
            .IsRequired();
    }
}
