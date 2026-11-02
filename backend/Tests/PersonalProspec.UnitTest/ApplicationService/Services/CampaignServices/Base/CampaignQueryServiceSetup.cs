using Moq;
using NodaTime;
using PersonalProspec.ApplicationService.Mappers;
using PersonalProspec.ApplicationService.Services.CampaignServices;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;

namespace PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices.Base;

public abstract class CampaignQueryServiceSetup
{
    protected readonly Guid BusinessUnitId = Guid.NewGuid();
    protected readonly Mock<ICampaignRepository> CampaignRepository = new();
    protected readonly Mock<IReferenceRepository> ReferenceRepository = new();
    protected readonly Mock<IEventRepository> EventRepository = new();
    protected readonly CampaignQueryService CampaignQueryService;

    protected CampaignQueryServiceSetup()
    {
        var clock = new Mock<IClock>();
        clock.Setup(c => c.GetCurrentInstant()).Returns(Instant.FromUtc(2026, 11, 2, 12, 0, 0));

        CampaignQueryService = new CampaignQueryService(
            CampaignRepository.Object,
            ReferenceRepository.Object,
            EventRepository.Object,
            new CampaignMapper(clock.Object));
    }
}
