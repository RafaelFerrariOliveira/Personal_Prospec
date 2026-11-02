using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Infra.ORM.Mappings.Base;

namespace PersonalProspec.Infra.ORM.Mappings;

public sealed class CampaignCnaeMapping : BaseMapping<CampaignCnae>
{
    public override void Configure(EntityTypeBuilder<CampaignCnae> builder)
    {
        builder.ToTable(nameof(CampaignCnae), Schema);

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Id)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("id")
            .HasColumnOrder(1)
            .ValueGeneratedNever()
            .IsRequired();

        builder.Property(n => n.CampaignId)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("campaign_id")
            .HasColumnOrder(2)
            .IsRequired();

        builder.Property(n => n.CnaeCode)
            .HasColumnType("varchar(7)")
            .HasColumnName("cnae_code")
            .HasColumnOrder(3)
            .IsRequired();

        builder.Property(n => n.BusinessUnitId)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("business_unit_id")
            .HasColumnOrder(4)
            .IsRequired();

        builder.HasIndex(n => new { n.CampaignId, n.CnaeCode }).IsUnique();
    }
}
