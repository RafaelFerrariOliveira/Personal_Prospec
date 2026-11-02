using Moq;
using NodaTime;
using PersonalProspec.ApplicationService.Services.CampaignServices;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;

namespace PersonalProspec.UnitTest.ApplicationService.Services.CampaignServices;

public sealed class CampaignEventRecorderTests
{
    private static readonly Instant Now = Instant.FromUtc(2026, 11, 2, 12, 0, 0);
    private readonly Mock<IEventRepository> _eventRepository = new();
    private readonly List<Event> _saved = [];
    private readonly CampaignEventRecorder _recorder;

    public CampaignEventRecorderTests()
    {
        var clock = new Mock<IClock>();
        clock.Setup(c => c.GetCurrentInstant()).Returns(Now);
        _eventRepository.Setup(r => r.SaveAsync(It.IsAny<Event>())).Callback<Event>(_saved.Add).ReturnsAsync(true);
        _recorder = new CampaignEventRecorder(_eventRepository.Object, clock.Object);
    }

    [Fact]
    [Trait("Recorder", "Perfect setting")]
    public async Task RecordAsync_Event_SavesCampaignCategorySourceAndTime()
    {
        var campaignId = Guid.NewGuid();
        var businessUnitId = Guid.NewGuid();

        await _recorder.RecordAsync(campaignId, businessUnitId, CampaignEventRecorder.Started, "Estado alterado.");

        var saved = Assert.Single(_saved);
        Assert.Equal(EEventCategory.Campaign, saved.Category);
        Assert.Equal("CampaignStarted", saved.Type);
        Assert.Equal("Campaign", saved.Source);
        Assert.Equal(campaignId, saved.CampaignId);
        Assert.Equal(businessUnitId, saved.BusinessUnitId);
        Assert.Equal(Now, saved.OccurredAt);
    }

    [Theory]
    [InlineData(500, 500)]
    [InlineData(501, 500)]
    [InlineData(800, 500)]
    [Trait("Recorder", "Description limit")]
    public async Task RecordAsync_LongDescription_IsTruncatedToFiveHundredCharacters(int length, int expected)
    {
        await _recorder.RecordAsync(Guid.NewGuid(), Guid.NewGuid(), CampaignEventRecorder.Updated, new string('a', length));

        Assert.Equal(expected, Assert.Single(_saved).Description.Length);
    }
}
