using Microsoft.EntityFrameworkCore;
using NodaTime;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Infra.ORM.Contexts;

namespace PersonalProspec.IntegrationTest.Settings.Seeds;

// Grava campanhas de teste direto no banco, por unidade de negócio, com referências reais do seed.
public static class CampaignSeedTools
{
    public static async Task<Campaign> CreateCampaignAsync(
        ApplicationContext context,
        Guid businessUnitId,
        ECampaignStatus status = ECampaignStatus.Draft,
        string name = "Campanha de teste")
    {
        var municipality = await context.Set<Municipality>().AsNoTracking().FirstAsync(m => m.State == "SP");
        var cnae = await context.Set<Cnae>().AsNoTracking().FirstAsync();
        var id = Guid.NewGuid();
        var now = SystemClock.Instance.GetCurrentInstant();

        var campaign = new Campaign
        {
            Id = id,
            RequestId = Guid.NewGuid(),
            Name = name,
            Objective = "Objetivo de teste",
            Segment = "Segmento de teste",
            TargetLeadCount = 10,
            Status = status,
            CreatedAt = now,
            UpdatedAt = now,
            BusinessUnitId = businessUnitId,
            Locations =
            [
                new CampaignLocation
                {
                    Id = Guid.NewGuid(), CampaignId = id, State = municipality.State,
                    MunicipalityCode = municipality.Code, BusinessUnitId = businessUnitId
                }
            ],
            Cnaes =
            [
                new CampaignCnae
                {
                    Id = Guid.NewGuid(), CampaignId = id, CnaeCode = cnae.Code, BusinessUnitId = businessUnitId
                }
            ]
        };

        context.Set<Campaign>().Add(campaign);
        await context.SaveChangesAsync();

        return campaign;
    }
}
