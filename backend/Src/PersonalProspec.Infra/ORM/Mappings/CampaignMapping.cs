using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Infra.ORM.Mappings.Base;

namespace PersonalProspec.Infra.ORM.Mappings;

public sealed class CampaignMapping : BaseMapping<Campaign>
{
    public override void Configure(EntityTypeBuilder<Campaign> builder)
    {
        builder.ToTable(nameof(Campaign), Schema);

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("id")
            .HasColumnOrder(1)
            .ValueGeneratedNever()
            .IsRequired();

        builder.Property(c => c.RequestId)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("request_id")
            .HasColumnOrder(2)
            .IsRequired();

        builder.Property(c => c.Name)
            .HasColumnType("nvarchar(120)")
            .HasColumnName("name")
            .HasColumnOrder(3)
            .IsRequired();

        builder.Property(c => c.Objective)
            .HasColumnType("nvarchar(500)")
            .HasColumnName("objective")
            .HasColumnOrder(4)
            .IsRequired();

        builder.Property(c => c.IdealProfile)
            .HasColumnType("nvarchar(1000)")
            .HasColumnName("ideal_profile")
            .HasColumnOrder(5)
            .IsRequired(false);

        builder.Property(c => c.Segment)
            .HasColumnType("nvarchar(120)")
            .HasColumnName("segment")
            .HasColumnOrder(6)
            .IsRequired();

        builder.Property(c => c.Services)
            .HasColumnType("nvarchar(1000)")
            .HasColumnName("services")
            .HasColumnOrder(7)
            .IsRequired(false);

        builder.Property(c => c.Differentials)
            .HasColumnType("nvarchar(1000)")
            .HasColumnName("differentials")
            .HasColumnOrder(8)
            .IsRequired(false);

        builder.Property(c => c.ValueProposition)
            .HasColumnType("nvarchar(1000)")
            .HasColumnName("value_proposition")
            .HasColumnOrder(9)
            .IsRequired(false);

        builder.Property(c => c.TargetLeadCount)
            .HasColumnType("int")
            .HasColumnName("target_lead_count")
            .HasColumnOrder(10)
            .IsRequired();

        builder.Property(c => c.Status)
            .HasColumnType("tinyint")
            .HasColumnName("status")
            .HasColumnOrder(11)
            .IsRequired();

        builder.Property(c => c.CreatedAt)
            .HasColumnType("datetime2")
            .HasColumnName("created_at")
            .HasColumnOrder(12)
            .IsRequired();

        builder.Property(c => c.UpdatedAt)
            .HasColumnType("datetime2")
            .HasColumnName("updated_at")
            .HasColumnOrder(13)
            .IsRequired();

        builder.Property(c => c.BusinessUnitId)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("business_unit_id")
            .HasColumnOrder(14)
            .IsRequired();

        builder.Property(c => c.RowVersion)
            .HasColumnType("rowversion")
            .HasColumnName("row_version")
            .HasColumnOrder(15)
            .IsRowVersion();

        builder.HasIndex(c => new { c.BusinessUnitId, c.RequestId }).IsUnique();
        builder.HasIndex(c => new { c.BusinessUnitId, c.Status, c.CreatedAt }).IsDescending(false, false, true);

        builder.HasMany(c => c.Locations)
            .WithOne(l => l.Campaign)
            .HasForeignKey(l => l.CampaignId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasMany(c => c.Cnaes)
            .WithOne(n => n.Campaign)
            .HasForeignKey(n => n.CampaignId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
