using PersonalProspec.Domain.Constants;

namespace PersonalProspec.UnitTest.Domain.Constants;

public sealed class PasswordRulesTests
{
    [Fact]
    [Trait("Categoria", "Regra de senha")]
    public void MinLength_Constant_IsEight()
    {
        Assert.Equal(8, PasswordRules.MinLength);
    }

    [Theory]
    [Trait("Categoria", "Regra de senha")]
    [InlineData("1234567", false)]
    [InlineData("12345678", true)]
    [InlineData("senha-longa-ficticia", true)]
    public void MinLength_PasswordLength_DefinesAcceptance(string password, bool expectedAccepted)
    {
        var accepted = password.Length >= PasswordRules.MinLength;

        Assert.Equal(expectedAccepted, accepted);
    }
}
