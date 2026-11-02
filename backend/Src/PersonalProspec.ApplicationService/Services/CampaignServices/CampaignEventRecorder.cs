using NodaTime;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;

namespace PersonalProspec.ApplicationService.Services.CampaignServices;

// Grava o histórico da campanha (FR-014) na tabela Event. A descrição nunca contém dado sensível:
// só estados e nomes de campo, em até 500 caracteres.
public sealed class CampaignEventRecorder(IEventRepository eventRepository, IClock clock)
{
    public const string Created = "CampaignCreated";
    public const string Updated = "CampaignUpdated";
    public const string Started = "CampaignStarted";
    public const string Paused = "CampaignPaused";
    public const string Resumed = "CampaignResumed";
    public const string Cancelled = "CampaignCancelled";

    private const int MaxDescriptionLength = 500;

    public async Task RecordAsync(Guid campaignId, Guid businessUnitId, string type, string description)
    {
        await eventRepository.SaveAsync(new Event
        {
            Category = EEventCategory.Campaign,
            Type = type,
            CampaignId = campaignId,
            Description = description.Length > MaxDescriptionLength ? description[..MaxDescriptionLength] : description,
            Source = "Campaign",
            OccurredAt = clock.GetCurrentInstant(),
            BusinessUnitId = businessUnitId
        });
    }
}
