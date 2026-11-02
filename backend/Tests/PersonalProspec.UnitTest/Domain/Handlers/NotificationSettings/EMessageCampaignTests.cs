using PersonalProspec.Domain.Extensions;
using PersonalProspec.Domain.Handlers.NotificationSettings;

namespace PersonalProspec.UnitTest.Domain.Handlers.NotificationSettings;

public sealed class EMessageCampaignTests
{
    public static TheoryData<EMessage> CampaignMessages =>
    [
        EMessage.CampaignInvalidTransition,
        EMessage.CampaignNotEditable,
        EMessage.OutOfRange,
        EMessage.CnaeNotFound,
        EMessage.MunicipalityNotInState,
        EMessage.ItemCountOutOfRange,
        EMessage.DuplicateItem,
        EMessage.CampaignIdInUse,
        EMessage.ConcurrencyConflict,
        EMessage.LocationsMustShareState
    ];

    [Theory]
    [MemberData(nameof(CampaignMessages))]
    [Trait("Categoria", "Mensagens de campanha")]
    public void GetDescription_CampaignMessage_HasNonEmptyDescriptionDifferentFromName(EMessage message)
    {
        var description = message.GetDescription();

        Assert.False(string.IsNullOrWhiteSpace(description));
        Assert.NotEqual(message.ToString(), description);
    }

    [Theory]
    [MemberData(nameof(CampaignMessages))]
    [Trait("Categoria", "Mensagens de campanha")]
    public void FormatTo_CampaignMessage_FillsEveryPlaceholder(EMessage message)
    {
        var result = message.GetDescription().FormatTo("a", "b", "c");

        Assert.DoesNotContain("{", result);
        Assert.DoesNotContain("}", result);
    }

    [Fact]
    [Trait("Categoria", "Mensagens de campanha")]
    public void FormatTo_CampaignInvalidTransition_ContainsStateAndAction()
    {
        var result = EMessage.CampaignInvalidTransition.GetDescription().FormatTo("em execução", "iniciada");

        Assert.Equal("A campanha está em execução e não pode ser iniciada.", result);
    }
}
