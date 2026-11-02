using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Handlers.CampaignSettings;

namespace PersonalProspec.UnitTest.Domain.Handlers.CampaignSettings;

public sealed class CampaignStateMachineTests
{
    private static readonly (ECampaignStatus From, ECampaignStatus To)[] Pairs =
    [
        (ECampaignStatus.Draft, ECampaignStatus.Running),
        (ECampaignStatus.Running, ECampaignStatus.Paused),
        (ECampaignStatus.Paused, ECampaignStatus.Running),
        (ECampaignStatus.Running, ECampaignStatus.Completed),
        (ECampaignStatus.Draft, ECampaignStatus.Cancelled),
        (ECampaignStatus.Running, ECampaignStatus.Cancelled),
        (ECampaignStatus.Paused, ECampaignStatus.Cancelled)
    ];

    public static TheoryData<ECampaignStatus, ECampaignStatus> ValidTransitions
    {
        get
        {
            var data = new TheoryData<ECampaignStatus, ECampaignStatus>();

            foreach (var (from, to) in Pairs)
                data.Add(from, to);

            return data;
        }
    }

    [Theory]
    [MemberData(nameof(ValidTransitions))]
    [Trait("Categoria", "Máquina de estados da campanha")]
    public void CanTransition_ValidPair_ReturnsTrue(ECampaignStatus from, ECampaignStatus to)
    {
        Assert.True(CampaignStateMachine.CanTransition(from, to));
    }

    [Fact]
    [Trait("Categoria", "Máquina de estados da campanha")]
    public void CanTransition_EveryPairOutsideTheTable_ReturnsFalse()
    {
        var statuses = Enum.GetValues<ECampaignStatus>();

        var invalid = statuses
            .SelectMany(from => statuses.Select(to => (from, to)))
            .Where(pair => !Pairs.Contains(pair))
            .ToList();

        Assert.NotEmpty(invalid);
        Assert.All(invalid, pair =>
            Assert.False(CampaignStateMachine.CanTransition(pair.from, pair.to), $"{pair.from} -> {pair.to}"));
    }

    [Theory]
    [InlineData(ECampaignStatus.Completed)]
    [InlineData(ECampaignStatus.Cancelled)]
    [Trait("Categoria", "Máquina de estados da campanha")]
    public void CanTransition_FromFinalState_ReturnsFalseForEveryTarget(ECampaignStatus final)
    {
        Assert.All(Enum.GetValues<ECampaignStatus>(), to => Assert.False(CampaignStateMachine.CanTransition(final, to)));
    }

    [Fact]
    [Trait("Categoria", "Máquina de estados da campanha")]
    public void CanTransition_RunningToRunning_ReturnsFalse()
    {
        Assert.False(CampaignStateMachine.CanTransition(ECampaignStatus.Running, ECampaignStatus.Running));
    }

    [Theory]
    [InlineData(ECampaignStatus.Draft, true)]
    [InlineData(ECampaignStatus.Paused, true)]
    [InlineData(ECampaignStatus.Running, false)]
    [InlineData(ECampaignStatus.Completed, false)]
    [InlineData(ECampaignStatus.Cancelled, false)]
    [Trait("Categoria", "Máquina de estados da campanha")]
    public void CanEdit_Status_OnlyDraftAndPausedAreEditable(ECampaignStatus status, bool expected)
    {
        Assert.Equal(expected, CampaignStateMachine.CanEdit(status));
    }
}
