using Moq;
using NodaTime;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Extensions;
using PersonalProspec.Domain.Handlers.NotificationSettings;
using PersonalProspec.UnitTest.Builders;
using PersonalProspec.UnitTest.ApplicationService.Services.AuthenticationServices.Base;

namespace PersonalProspec.UnitTest.ApplicationService.Services.AuthenticationServices;

public sealed class LoginAsyncTests : AuthenticationCommandServiceSetup
{
    private const string Password = "senha-ficticia-123";
    private readonly User _user = UserBuilderTest.NewObject().WithEmail("conta@exemplo.test").Build();

    private static string InvalidCredentialsMessage => EMessage.InvalidCredentials.GetDescription();

    private void GivenExistingUser(bool passwordIsCorrect = true, params bool[] lockedOutSequence)
    {
        UserManager.Setup(u => u.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(_user);
        UserManager.Setup(u => u.CheckPasswordAsync(_user, It.IsAny<string>())).ReturnsAsync(passwordIsCorrect);

        var sequence = UserManager.SetupSequence(u => u.IsLockedOutAsync(_user));
        foreach (var locked in lockedOutSequence.Length == 0 ? [false, false] : lockedOutSequence)
            sequence = sequence.ReturnsAsync(locked);
    }

    [Fact]
    [Trait("Login", "Perfect setting")]
    public async Task LoginAsync_ValidCredentials_StoresOnlyRefreshHashAndWritesCookies()
    {
        GivenExistingUser();

        var result = await AuthenticationCommandService.LoginAsync(
            LoginRequestBuilderTest.NewObject().WithEmail("conta@exemplo.test").WithPassword(Password).Build());

        Assert.True(result);
        Assert.False(Notification.HasNotification());
        RefreshTokenRepository.Verify(r => r.SaveAsync(It.Is<RefreshToken>(t =>
            t.TokenHash == "hash-de-refresh-cru-novo"
            && t.TokenHash != "refresh-cru-novo"
            && t.UserId == _user.Id
            && t.BusinessUnitId == _user.BusinessUnitId
            && t.ExpiresAt == Now.Plus(Duration.FromMinutes(30)))), Times.Once);
        AuthCookieHandler.Verify(c => c.SetSession("access-ficticio", "refresh-cru-novo"), Times.Once);
    }

    [Fact]
    [Trait("Login", "Normalization")]
    public async Task LoginAsync_EmailWithUpperCaseAndSpaces_LooksUpNormalizedEmail()
    {
        GivenExistingUser();

        await AuthenticationCommandService.LoginAsync(
            LoginRequestBuilderTest.NewObject().WithEmail("  Conta@Exemplo.TEST ").WithPassword(Password).Build());

        UserManager.Verify(u => u.FindByEmailAsync("conta@exemplo.test"), Times.Once);
    }

    [Fact]
    [Trait("Login", "Invalid credentials")]
    public async Task LoginAsync_WrongPassword_ReturnsInvalidCredentialsAndCountsFailure()
    {
        GivenExistingUser(passwordIsCorrect: false);

        var result = await AuthenticationCommandService.LoginAsync(
            LoginRequestBuilderTest.NewObject().WithPassword("senha-errada-ficticia").Build());

        Assert.False(result);
        Assert.Equal(InvalidCredentialsMessage, SingleNotificationMessage());
        UserManager.Verify(u => u.AccessFailedAsync(_user), Times.Once);
        AuthCookieHandler.Verify(c => c.SetSession(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    [Trait("Login", "Invalid credentials")]
    public async Task LoginAsync_UnknownEmail_ReturnsSameNotificationAsWrongPassword()
    {
        UserManager.Setup(u => u.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);

        var result = await AuthenticationCommandService.LoginAsync(
            LoginRequestBuilderTest.NewObject().WithEmail("inexistente@exemplo.test").Build());

        var notification = Assert.Single(Notification.GetNotifications());
        Assert.False(result);
        Assert.Equal(InvalidCredentialsMessage, notification.Value);
        PasswordHasher.Verify(h => h.VerifyHashedPassword(
            It.IsAny<User>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
        UserManager.Verify(u => u.AccessFailedAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    [Trait("Login", "Invalid credentials")]
    public async Task LoginAsync_EmptyEmail_ReturnsSameNotificationWithoutLookup()
    {
        var result = await AuthenticationCommandService.LoginAsync(
            LoginRequestBuilderTest.NewObject().WithEmail("   ").Build());

        Assert.False(result);
        Assert.Equal(InvalidCredentialsMessage, SingleNotificationMessage());
        UserManager.Verify(u => u.FindByEmailAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    [Trait("Login", "Invalid credentials")]
    public async Task LoginAsync_EmptyPassword_ReturnsSameNotificationWithoutCheckingPassword()
    {
        GivenExistingUser();

        var result = await AuthenticationCommandService.LoginAsync(
            LoginRequestBuilderTest.NewObject().WithPassword(string.Empty).Build());

        Assert.False(result);
        Assert.Equal(InvalidCredentialsMessage, SingleNotificationMessage());
        UserManager.Verify(u => u.CheckPasswordAsync(It.IsAny<User>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    [Trait("Login", "Lockout")]
    public async Task LoginAsync_FailureThatReachesLimit_ReturnsLockedOutAndRecordsEvent()
    {
        GivenExistingUser(false, false, true);
        UserManager.Setup(u => u.GetLockoutEndDateAsync(_user)).ReturnsAsync(Now.Plus(Duration.FromMinutes(5)).ToDateTimeOffset());

        var result = await AuthenticationCommandService.LoginAsync(
            LoginRequestBuilderTest.NewObject().WithPassword("senha-errada-ficticia").Build());

        Assert.False(result);
        Assert.Equal(EMessage.LockedOut.GetDescription().FormatTo("5 minutos"), SingleNotificationMessage());
        Assert.Contains(RecordedEvents, e => e.Type == "LoginLockedOut");
    }

    [Fact]
    [Trait("Login", "Lockout")]
    public async Task LoginAsync_LockedOutAccount_InformsRemainingTimeAndSkipsPasswordCheck()
    {
        GivenExistingUser(true, true);
        UserManager.Setup(u => u.GetLockoutEndDateAsync(_user)).ReturnsAsync(Now.Plus(Duration.FromMinutes(4)).ToDateTimeOffset());

        var result = await AuthenticationCommandService.LoginAsync(LoginRequestBuilderTest.NewObject().Build());

        Assert.False(result);
        Assert.Equal(EMessage.LockedOut.GetDescription().FormatTo("4 minutos"), SingleNotificationMessage());
        UserManager.Verify(u => u.CheckPasswordAsync(It.IsAny<User>(), It.IsAny<string>()), Times.Never);
        AuthCookieHandler.Verify(c => c.SetSession(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    [Trait("Login", "Lockout")]
    public async Task LoginAsync_LockoutEndsInLessThanOneMinute_InformsLessThanOneMinute()
    {
        GivenExistingUser(true, true);
        UserManager.Setup(u => u.GetLockoutEndDateAsync(_user)).ReturnsAsync(Now.Plus(Duration.FromSeconds(30)).ToDateTimeOffset());

        await AuthenticationCommandService.LoginAsync(LoginRequestBuilderTest.NewObject().Build());

        Assert.Equal(EMessage.LockedOut.GetDescription().FormatTo("menos de 1 minuto"), SingleNotificationMessage());
    }

    [Fact]
    [Trait("Login", "Perfect setting")]
    public async Task LoginAsync_ValidCredentials_ResetsFailureCountAndRecordsSuccessEvent()
    {
        GivenExistingUser();

        await AuthenticationCommandService.LoginAsync(LoginRequestBuilderTest.NewObject().WithPassword(Password).Build());

        UserManager.Verify(u => u.ResetAccessFailedCountAsync(_user), Times.Once);
        UserManager.Verify(u => u.AccessFailedAsync(It.IsAny<User>()), Times.Never);
        var recorded = Assert.Single(RecordedEvents);
        Assert.Equal("LoginSucceeded", recorded.Type);
        Assert.Equal(EEventCategory.Auth, recorded.Category);
    }

    [Fact]
    [Trait("Login", "Security: no secret in event")]
    public async Task LoginAsync_AnyOutcome_NeverWritesPasswordOrEmailInEventDescription()
    {
        GivenExistingUser(passwordIsCorrect: false);

        await AuthenticationCommandService.LoginAsync(
            LoginRequestBuilderTest.NewObject().WithEmail("conta@exemplo.test").WithPassword("senha-sigilosa-777").Build());

        var recorded = Assert.Single(RecordedEvents);
        Assert.DoesNotContain("senha-sigilosa-777", recorded.Description);
        Assert.DoesNotContain("conta@exemplo.test", recorded.Description);
        Assert.Equal("LoginFailed", recorded.Type);
    }
}
