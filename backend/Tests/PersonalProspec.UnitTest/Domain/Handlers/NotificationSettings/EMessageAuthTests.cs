using PersonalProspec.Domain.Extensions;
using PersonalProspec.Domain.Handlers.NotificationSettings;

namespace PersonalProspec.UnitTest.Domain.Handlers.NotificationSettings;

public sealed class EMessageAuthTests
{
    public static TheoryData<EMessage> AuthMessages =>
    [
        EMessage.InvalidCredentials,
        EMessage.LockedOut,
        EMessage.MinLength,
        EMessage.UnexpectedError,
        EMessage.InvalidRequest
    ];

    [Theory]
    [MemberData(nameof(AuthMessages))]
    [Trait("Categoria", "Mensagens de acesso")]
    public void GetDescription_AuthMessage_HasNonEmptyDescriptionDifferentFromName(EMessage message)
    {
        var description = message.GetDescription();

        Assert.False(string.IsNullOrWhiteSpace(description));
        Assert.NotEqual(message.ToString(), description);
    }

    [Theory]
    [MemberData(nameof(AuthMessages))]
    [Trait("Categoria", "Mensagens de acesso")]
    public void FormatTo_AuthMessage_FillsEveryPlaceholder(EMessage message)
    {
        var result = message.GetDescription().FormatTo("valor-a", "valor-b");

        Assert.DoesNotContain("{", result);
        Assert.DoesNotContain("}", result);
    }

    [Fact]
    [Trait("Categoria", "Mensagens de acesso")]
    public void FormatTo_LockedOut_ContainsTheWaitingTime()
    {
        var result = EMessage.LockedOut.GetDescription().FormatTo("5 minutos");

        Assert.Equal("Muitas tentativas. Tente novamente em 5 minutos.", result);
    }

    [Fact]
    [Trait("Categoria", "Mensagens de acesso")]
    public void FormatTo_MinLength_ContainsFieldAndLength()
    {
        var result = EMessage.MinLength.GetDescription().FormatTo("Senha", 8);

        Assert.Equal("O campo Senha exige no mínimo 8 caracteres.", result);
    }

    [Fact]
    [Trait("Categoria", "Mensagens de acesso")]
    public void GetDescription_InvalidCredentials_DoesNotRevealWhichFieldFailed()
    {
        var description = EMessage.InvalidCredentials.GetDescription();

        Assert.Equal("E-mail ou senha inválidos.", description);
    }
}
