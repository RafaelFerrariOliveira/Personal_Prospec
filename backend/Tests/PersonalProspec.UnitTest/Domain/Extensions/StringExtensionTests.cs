using PersonalProspec.Domain.Extensions;
using PersonalProspec.Domain.Handlers.NotificationSettings;

namespace PersonalProspec.UnitTest.Domain.Extensions;

public sealed class StringExtensionTests
{
    [Fact]
    [Trait("Extension", "Perfect setting")]
    public void FormatTo_MessageWithPlaceholders_ReturnsFormattedMessage()
    {
        var result = EMessage.MoreExpected.GetDescription().FormatTo("Nome", "até 50");

        Assert.Equal("O campo Nome permite até 50 caracteres.", result);
    }
}
