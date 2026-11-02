using PersonalProspec.Domain.Enums;

namespace PersonalProspec.ApplicationService.Extensions;

public static class CampaignStatusExtension
{
    extension(ECampaignStatus status)
    {
        // Rótulo em pt-BR para mensagens ("A campanha está em execução ...").
        public string ToLabel() => status switch
        {
            ECampaignStatus.Draft => "em rascunho",
            ECampaignStatus.Running => "em execução",
            ECampaignStatus.Paused => "pausada",
            ECampaignStatus.Completed => "concluída",
            ECampaignStatus.Cancelled => "cancelada",
            _ => status.ToString()
        };
    }
}
