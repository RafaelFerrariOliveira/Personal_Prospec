using Microsoft.AspNetCore.Identity;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Domain.Providers;
using PersonalProspec.Infra.Identity;
using PersonalProspec.UnitTest.Builders;

namespace PersonalProspec.UnitTest.Infra.Identity;

public sealed class ArgonTwoPasswordHasherTests
{
    private const string Password = "senha-ficticia-123";
    private readonly User _user = UserBuilderTest.NewObject().Build();

    private static ArgonTwoPasswordHasher<User> NewHasher(string pepper = "pepper-ficticio-a") =>
        new(new PepperOptions { Secret = pepper });

    [Fact]
    [Trait("Categoria", "Hash de senha")]
    public void HashPassword_ValidPassword_DiffersFromPlainText()
    {
        var hash = NewHasher().HashPassword(_user, Password);

        Assert.NotEqual(Password, hash);
        Assert.DoesNotContain(Password, hash);
    }

    [Fact]
    [Trait("Categoria", "Hash de senha")]
    public void HashPassword_ValidPassword_StartsWithCurrentVersionByte()
    {
        var payload = Convert.FromBase64String(NewHasher().HashPassword(_user, Password));

        Assert.Equal(1, payload[0]);
        Assert.Equal(1 + 16 + 32, payload.Length);
    }

    [Fact]
    [Trait("Categoria", "Hash de senha")]
    public void VerifyHashedPassword_CorrectPassword_ReturnsSuccess()
    {
        var hasher = NewHasher();
        var hash = hasher.HashPassword(_user, Password);

        var result = hasher.VerifyHashedPassword(_user, hash, Password);

        Assert.Equal(PasswordVerificationResult.Success, result);
    }

    [Fact]
    [Trait("Categoria", "Hash de senha")]
    public void VerifyHashedPassword_WrongPassword_ReturnsFailed()
    {
        var hasher = NewHasher();
        var hash = hasher.HashPassword(_user, Password);

        var result = hasher.VerifyHashedPassword(_user, hash, "outra-senha-ficticia");

        Assert.Equal(PasswordVerificationResult.Failed, result);
    }

    [Fact]
    [Trait("Categoria", "Hash de senha")]
    public void HashPassword_SamePasswordTwice_ProducesDifferentHashesBecauseOfSalt()
    {
        var hasher = NewHasher();

        var first = hasher.HashPassword(_user, Password);
        var second = hasher.HashPassword(_user, Password);

        Assert.NotEqual(first, second);
        Assert.Equal(PasswordVerificationResult.Success, hasher.VerifyHashedPassword(_user, first, Password));
        Assert.Equal(PasswordVerificationResult.Success, hasher.VerifyHashedPassword(_user, second, Password));
    }

    [Fact]
    [Trait("Categoria", "Hash de senha")]
    public void VerifyHashedPassword_DifferentPepper_ReturnsFailed()
    {
        var hash = NewHasher("pepper-ficticio-a").HashPassword(_user, Password);

        var result = NewHasher("pepper-ficticio-b").VerifyHashedPassword(_user, hash, Password);

        Assert.Equal(PasswordVerificationResult.Failed, result);
    }

    [Fact]
    [Trait("Categoria", "Hash de senha")]
    public void VerifyHashedPassword_UnknownVersion_ReturnsFailed()
    {
        var hasher = NewHasher();
        var payload = Convert.FromBase64String(hasher.HashPassword(_user, Password));
        payload[0] = 99;

        var result = hasher.VerifyHashedPassword(_user, Convert.ToBase64String(payload), Password);

        Assert.Equal(PasswordVerificationResult.Failed, result);
    }

    [Theory]
    [Trait("Categoria", "Hash de senha")]
    [InlineData("")]
    [InlineData("isto não é base64!!")]
    [InlineData("AQ==")]
    [InlineData("AQIDBA==")]
    public void VerifyHashedPassword_InvalidFormat_ReturnsFailedWithoutThrowing(string invalidHash)
    {
        var result = NewHasher().VerifyHashedPassword(_user, invalidHash, Password);

        Assert.Equal(PasswordVerificationResult.Failed, result);
    }

    [Fact]
    [Trait("Categoria", "Hash de senha")]
    public void VerifyHashedPassword_TamperedHashBytes_ReturnsFailed()
    {
        var hasher = NewHasher();
        var payload = Convert.FromBase64String(hasher.HashPassword(_user, Password));
        payload[^1] ^= 0xFF;

        var result = hasher.VerifyHashedPassword(_user, Convert.ToBase64String(payload), Password);

        Assert.Equal(PasswordVerificationResult.Failed, result);
    }
}
