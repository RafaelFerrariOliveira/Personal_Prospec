using Moq;
using NodaTime;
using PersonalProspec.UnitTest.ApplicationService.Services.AuthenticationServices.Base;

namespace PersonalProspec.UnitTest.ApplicationService.Services.AuthenticationServices;

public sealed class LogoutAsyncTests : AuthenticationCommandServiceSetup
{
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _businessUnitId = Guid.NewGuid();

    [Fact]
    [Trait("Logout", "Perfect setting")]
    public async Task LogoutAsync_AuthenticatedUser_RevokesAllRefreshOfTheUserAndClearsCookies()
    {
        var result = await AuthenticationCommandService.LogoutAsync(_userId, _businessUnitId);

        Assert.True(result);
        RefreshTokenRepository.Verify(r => r.RevokeAllByUserAsync(_userId, Now), Times.Once);
        AuthCookieHandler.Verify(c => c.ClearSession(), Times.Once);
        Assert.False(Notification.HasNotification());
    }

    [Fact]
    [Trait("Logout", "Event")]
    public async Task LogoutAsync_AuthenticatedUser_RecordsLogoutEventWithTheBusinessUnit()
    {
        await AuthenticationCommandService.LogoutAsync(_userId, _businessUnitId);

        var recorded = Assert.Single(RecordedEvents);
        Assert.Equal("Logout", recorded.Type);
        Assert.Equal(_businessUnitId, recorded.BusinessUnitId);
    }

    [Fact]
    [Trait("Logout", "No dependence on refresh cookie")]
    public async Task LogoutAsync_WithoutRefreshCookie_StillRevokesAllAndClearsCookies()
    {
        AuthCookieHandler.Setup(c => c.GetRefreshToken()).Returns((string?)null);

        var result = await AuthenticationCommandService.LogoutAsync(_userId, _businessUnitId);

        Assert.True(result);
        AuthCookieHandler.Verify(c => c.GetRefreshToken(), Times.Never);
        RefreshTokenRepository.Verify(r => r.FindByTokenHashAsync(It.IsAny<string>()), Times.Never);
        RefreshTokenRepository.Verify(r => r.RevokeAllByUserAsync(_userId, Now), Times.Once);
        AuthCookieHandler.Verify(c => c.ClearSession(), Times.Once);
    }

    [Fact]
    [Trait("Logout", "Scope")]
    public async Task LogoutAsync_AuthenticatedUser_NeverRevokesRefreshOfAnotherUser()
    {
        await AuthenticationCommandService.LogoutAsync(_userId, _businessUnitId);

        RefreshTokenRepository.Verify(r => r.RevokeAllByUserAsync(It.Is<Guid>(id => id != _userId), It.IsAny<Instant>()), Times.Never);
        RefreshTokenRepository.Verify(r => r.RevokeByIdAsync(It.IsAny<Guid>(), It.IsAny<Instant>()), Times.Never);
    }
}
