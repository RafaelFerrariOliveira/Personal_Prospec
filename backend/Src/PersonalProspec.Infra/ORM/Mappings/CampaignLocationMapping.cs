using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Infra.ORM.Mappings.Base;

namespace PersonalProspec.Infra.ORM.Mappings;

public sealed class CampaignLocationMapping : BaseMapping<CampaignLocation>
{
    public override void Configure(EntityTypeBuilder<CampaignLocation> builder)
    {
        builder.ToTable(nameof(CampaignLocation), Schema);

        builder.HasKey(l => l.Id);

        builder.Property(l => l.Id)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("id")
            .HasColumnOrder(1)
            .ValueGeneratedNever()
            .IsRequired();

        builder.Property(l => l.CampaignId)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("campaign_id")
            .HasColumnOrder(2)
            .IsRequired();

        builder.Property(l => l.State)
            .HasColumnType("char(2)")
            .HasColumnName("state")
            .HasColumnOrder(3)
            .IsRequired();

        builder.Property(l => l.MunicipalityCode)
            .HasColumnType("char(4)")
            .HasColumnName("municipality_code")
            .HasColumnOrder(4)
            .IsRequired();

        builder.Property(l => l.BusinessUnitId)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("business_unit_id")
            .HasColumnOrder(5)
            .IsRequired();

        builder.HasIndex(l => new { l.CampaignId, l.State, l.MunicipalityCode }).IsUnique();
    }
}
