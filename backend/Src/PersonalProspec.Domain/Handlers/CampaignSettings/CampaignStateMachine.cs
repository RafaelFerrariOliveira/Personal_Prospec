using PersonalProspec.Domain.Enums;

namespace PersonalProspec.Domain.Handlers.CampaignSettings;

// Tabela única de transições da campanha. Completed só é atribuído pela pesquisa (spec 003).
public static class CampaignStateMachine
{
    public static bool CanTransition(ECampaignStatus from, ECampaignStatus to) => (from, to) switch
    {
        (ECampaignStatus.Draft, ECampaignStatus.Running) => true,
        (ECampaignStatus.Running, ECampaignStatus.Paused) => true,
        (ECampaignStatus.Paused, ECampaignStatus.Running) => true,
        (ECampaignStatus.Running, ECampaignStatus.Completed) => true,
        (ECampaignStatus.Draft or ECampaignStatus.Running or ECampaignStatus.Paused, ECampaignStatus.Cancelled) => true,
        _ => false
    };

    public static bool CanEdit(ECampaignStatus status) =>
        status is ECampaignStatus.Draft or ECampaignStatus.Paused;
}
