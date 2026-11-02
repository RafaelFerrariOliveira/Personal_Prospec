using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Infra.ORM.Mappings.Base;

namespace PersonalProspec.Infra.ORM.Mappings;

public sealed class EventMapping : BaseMapping<Event>
{
    public override void Configure(EntityTypeBuilder<Event> builder)
    {
        builder.ToTable(nameof(Event), Schema);

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("id")
            .HasColumnOrder(1)
            .ValueGeneratedOnAdd()
            .IsRequired();

        builder.Property(e => e.Category)
            .HasColumnType("tinyint")
            .HasColumnName("category")
            .HasColumnOrder(2)
            .IsRequired();

        builder.Property(e => e.Type)
            .HasColumnType("varchar(100)")
            .HasColumnName("type")
            .HasColumnOrder(3)
            .IsRequired();

        // Sem chave estrangeira: Company e Campaign só existem nas specs 007 e 001.
        builder.Property(e => e.CompanyId)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("company_id")
            .HasColumnOrder(4)
            .IsRequired(false);

        builder.Property(e => e.CampaignId)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("campaign_id")
            .HasColumnOrder(5)
            .IsRequired(false);

        builder.Property(e => e.Description)
            .HasColumnType("nvarchar(500)")
            .HasColumnName("description")
            .HasColumnOrder(6)
            .IsRequired();

        builder.Property(e => e.Source)
            .HasColumnType("varchar(100)")
            .HasColumnName("source")
            .HasColumnOrder(7)
            .IsRequired();

        builder.Property(e => e.OccurredAt)
            .HasColumnType("datetime2")
            .HasColumnName("occurred_at")
            .HasColumnOrder(8)
            .IsRequired();

        builder.Property(e => e.BusinessUnitId)
            .HasColumnType("uniqueidentifier")
            .HasColumnName("business_unit_id")
            .HasColumnOrder(9)
            .IsRequired();

        builder.HasIndex(e => new { e.CompanyId, e.OccurredAt });
        builder.HasIndex(e => new { e.CampaignId, e.OccurredAt });
    }
}
