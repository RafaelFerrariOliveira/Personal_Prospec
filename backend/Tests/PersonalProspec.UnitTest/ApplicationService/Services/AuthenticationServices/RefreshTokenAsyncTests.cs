using Moq;
using NodaTime;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Domain.Extensions;
using PersonalProspec.Domain.Handlers.NotificationSettings;
using PersonalProspec.UnitTest.Builders;
using PersonalProspec.UnitTest.ApplicationService.Services.AuthenticationServices.Base;

namespace PersonalProspec.UnitTest.ApplicationService.Services.AuthenticationServices;

public sealed class RefreshTokenAsyncTests : AuthenticationCommandServiceSetup
{
    private readonly User _user = UserBuilderTest.NewObject().Build();

    private static string SessionExpiredMessage => EMessage.SessionExpired.GetDescription();

    private RefreshToken GivenStored(Func<RefreshTokenBuilderTest, RefreshTokenBuilderTest>? customize = null)
    {
        var builder = RefreshTokenBuilderTest.NewObject().WithUserId(_user.Id).WithBusinessUnitId(_user.BusinessUnitId);
        var stored = (customize?.Invoke(builder) ?? builder).Build();

        AuthCookieHandler.Setup(c => c.GetRefreshToken()).Returns("refresh-cru");
        RefreshTokenRepository.Setup(r => r.FindByTokenHashAsync("hash-de-refresh-cru")).ReturnsAsync(stored);
        UserManager.Setup(u => u.FindByIdAsync(_user.Id.ToString())).ReturnsAsync(_user);

        return stored;
    }

    [Fact]
    [Trait("Refresh", "Perfect setting")]
    public async Task RefreshTokenAsync_ValidRefresh_RotatesRevokingOldAndIssuingNewPair()
    {
        var stored = GivenStored();

        var result = await AuthenticationCommandService.RefreshTokenAsync();

        Assert.True(result);
        Assert.False(Notification.HasNotification());
        RefreshTokenRepository.Verify(r => r.RevokeByIdAsync(stored.Id, Now), Times.Once);
        RefreshTokenRepository.Verify(r => r.SaveAsync(It.Is<RefreshToken>(t =>
            t.TokenHash == "hash-de-refresh-cru-novo" && t.UserId == _user.Id)), Times.Once);
        AuthCookieHandler.Verify(c => c.SetSession("access-ficticio", "refresh-cru-novo"), Times.Once);
    }

    [Fact]
    [Trait("Refresh", "No cookie")]
    public async Task RefreshTokenAsync_NoCookie_ReturnsSessionExpired()
    {
        AuthCookieHandler.Setup(c => c.GetRefreshToken()).Returns((string?)null);

        var result = await AuthenticationCommandService.RefreshTokenAsync();

        Assert.False(result);
        Assert.Equal(SessionExpiredMessage, SingleNotificationMessage());
        AuthCookieHandler.Verify(c => c.SetSession(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    [Trait("Refresh", "Unknown token")]
    public async Task RefreshTokenAsync_UnknownRefresh_ReturnsSessionExpiredAndClearsCookies()
    {
        AuthCookieHandler.Setup(c => c.GetRefreshToken()).Returns("refresh-cru");
        RefreshTokenRepository.Setup(r => r.FindByTokenHashAsync(It.IsAny<string>())).ReturnsAsync((RefreshToken?)null);

        var result = await AuthenticationCommandService.RefreshTokenAsync();

        Assert.False(result);
        Assert.Equal(SessionExpiredMessage, SingleNotificationMessage());
        AuthCookieHandler.Verify(c => c.ClearSession(), Times.Once);
    }

    [Fact]
    [Trait("Refresh", "Expired")]
    public async Task RefreshTokenAsync_ExpiredRefresh_IsRefusedWithoutRotation()
    {
        GivenStored(b => b.WithExpiresAt(Now.Minus(Duration.FromSeconds(1))));

        var result = await AuthenticationCommandService.RefreshTokenAsync();

        Assert.False(result);
        Assert.Equal(SessionExpiredMessage, SingleNotificationMessage());
        RefreshTokenRepository.Verify(r => r.SaveAsync(It.IsAny<RefreshToken>()), Times.Never);
        RefreshTokenRepository.Verify(r => r.RevokeByIdAsync(It.IsAny<Guid>(), It.IsAny<Instant>()), Times.Never);
        AuthCookieHandler.Verify(c => c.ClearSession(), Times.Once);
    }

    [Fact]
    [Trait("Refresh", "Revoked reuse")]
    public async Task RefreshTokenAsync_RevokedRefreshReused_RevokesAllOfTheUserAndRecordsEvent()
    {
        GivenStored(b => b.WithRevokedAt(Now.Minus(Duration.FromMinutes(1))));

        var result = await AuthenticationCommandService.RefreshTokenAsync();

        Assert.False(result);
        Assert.Equal(SessionExpiredMessage, SingleNotificationMessage());
        RefreshTokenRepository.Verify(r => r.RevokeAllByUserAsync(_user.Id, Now), Times.Once);
        Assert.Contains(RecordedEvents, e => e.Type == "RefreshReuseDetected");
        RefreshTokenRepository.Verify(r => r.SaveAsync(It.IsAny<RefreshToken>()), Times.Never);
        AuthCookieHandler.Verify(c => c.ClearSession(), Times.Once);
    }

    [Fact]
    [Trait("Refresh", "Security: other tenant")]
    public async Task RefreshTokenAsync_UserFromAnotherBusinessUnit_IsRefused()
    {
        GivenStored(b => b.WithBusinessUnitId(Guid.NewGuid()));

        var result = await AuthenticationCommandService.RefreshTokenAsync();

        Assert.False(result);
        Assert.Equal(SessionExpiredMessage, SingleNotificationMessage());
        RefreshTokenRepository.Verify(r => r.SaveAsync(It.IsAny<RefreshToken>()), Times.Never);
    }

    [Fact]
    [Trait("Refresh", "Missing user")]
    public async Task RefreshTokenAsync_UserNoLongerExists_IsRefused()
    {
        GivenStored();
        UserManager.Setup(u => u.FindByIdAsync(_user.Id.ToString())).ReturnsAsync((User?)null);

        var result = await AuthenticationCommandService.RefreshTokenAsync();

        Assert.False(result);
        Assert.Equal(SessionExpiredMessage, SingleNotificationMessage());
        AuthCookieHandler.Verify(c => c.ClearSession(), Times.Once);
    }
}
