using PersonalProspec.Domain.Extensions;
using PersonalProspec.Domain.Handlers.NotificationSettings;

namespace PersonalProspec.UnitTest.Domain.Extensions;

public sealed class EnumExtensionTests
{
    private enum ESampleWithoutDescription
    {
        Plain = 1
    }

    [Fact]
    [Trait("Extension", "Perfect setting")]
    public void GetDescription_EnumWithDescription_ReturnsDescription()
    {
        var result = EMessage.Required.GetDescription();

        Assert.Equal("O campo {0} é obrigatório.", result);
    }

    [Fact]
    [Trait("Extension", "Without attribute")]
    public void GetDescription_EnumWithoutDescription_ReturnsName()
    {
        var result = ESampleWithoutDescription.Plain.GetDescription();

        Assert.Equal(nameof(ESampleWithoutDescription.Plain), result);
    }
}
