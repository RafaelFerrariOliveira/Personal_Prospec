using Moq;
using NodaTime;
using PersonalProspec.ApplicationService.Mappers;
using PersonalProspec.ApplicationService.Services.CampaignServices;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.EntitiesValidation;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Handlers.NotificationSettings;
using PersonalProspec.Domain.Interfaces;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;
using PersonalProspec.Domain.Providers;
using PersonalProspec.UnitTest.Builders;

namespace PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices.Base;

public abstract class CampaignCommandServiceSetup
{
    protected static readonly Instant Now = Instant.FromUtc(2026, 11, 2, 12, 0, 0);

    protected static readonly CampaignOptions Options = new()
    {
        MaxTargetLeadCount = 500,
        MaxCnaePerCampaign = 20,
        MaxCitiesPerCampaign = 30,
        NameMaxLength = 120,
        ObjectiveMaxLength = 500,
        SegmentMaxLength = 120,
        LongTextMaxLength = 1000
    };

    protected readonly Guid BusinessUnitId = Guid.NewGuid();
    protected readonly NotificationHandler Notification = new();
    protected readonly Mock<ICampaignRepository> CampaignRepository = new();
    protected readonly Mock<IReferenceRepository> ReferenceRepository = new();
    protected readonly Mock<IEventRepository> EventRepository = new();
    protected readonly List<Event> RecordedEvents = [];
    protected readonly CampaignCommandService CampaignCommandService;

    protected CampaignCommandServiceSetup()
    {
        var clock = new Mock<IClock>();
        clock.Setup(c => c.GetCurrentInstant()).Returns(Now);

        EventRepository
            .Setup(r => r.SaveAsync(It.IsAny<Event>()))
            .Callback<Event>(RecordedEvents.Add)
            .ReturnsAsync(true);

        // Por padrão toda referência pedida existe: CNAE e município (em SP).
        ReferenceRepository
            .Setup(r => r.FindCnaesByCodesAsync(It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync((IReadOnlyCollection<string> codes) =>
                (IReadOnlyList<Cnae>)codes.Select(c => new Cnae { Code = c, Description = $"CNAE {c}" }).ToList());

        ReferenceRepository
            .Setup(r => r.FindMunicipalitiesByCodesAsync(It.IsAny<IReadOnlyCollection<string>>()))
            .ReturnsAsync((IReadOnlyCollection<string> codes) =>
                (IReadOnlyList<Municipality>)codes.Select(c => new Municipality { Code = c, State = "SP", Name = $"CIDADE {c}" }).ToList());

        CampaignRepository.Setup(r => r.SaveAsync(It.IsAny<Campaign>())).ReturnsAsync(true);
        CampaignRepository.Setup(r => r.UpdateAsync(It.IsAny<Campaign>())).ReturnsAsync(true);
        CampaignRepository
            .Setup(r => r.UpdateWithChildrenAsync(
                It.IsAny<Campaign>(), It.IsAny<IReadOnlyList<CampaignLocation>>(), It.IsAny<IReadOnlyList<CampaignCnae>>()))
            .ReturnsAsync(true);

        CampaignCommandService = new CampaignCommandService(
            Notification,
            Mock.Of<ILoggerHandler>(),
            CampaignRepository.Object,
            ReferenceRepository.Object,
            new CampaignMapper(clock.Object),
            new CampaignValidation(Options),
            new CampaignEventRecorder(EventRepository.Object, clock.Object),
            clock.Object);
    }

    protected Campaign GivenCampaign(ECampaignStatus status)
    {
        var campaign = CampaignBuilderTest.NewObject().WithStatus(status).WithBusinessUnitId(BusinessUnitId).Build();

        CampaignRepository
            .Setup(r => r.FindByIdAsync(campaign.Id, BusinessUnitId, false))
            .ReturnsAsync(campaign);

        return campaign;
    }

    protected string SingleNotificationMessage() => Assert.Single(Notification.GetNotifications()).Value;
}
