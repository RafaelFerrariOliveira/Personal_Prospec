using Microsoft.AspNetCore.Identity;
using Moq;
using NodaTime;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.ApplicationService.Services.AuthenticationServices;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Domain.Handlers.NotificationSettings;
using PersonalProspec.Domain.Interfaces;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;
using PersonalProspec.Domain.Providers;

namespace PersonalProspec.UnitTest.ApplicationService.Services.AuthenticationServices.Base;

public abstract class AuthenticationCommandServiceSetup
{
    protected static readonly Instant Now = Instant.FromUtc(2026, 11, 2, 12, 0, 0);

    protected readonly NotificationHandler Notification = new();
    protected readonly Mock<UserManager<User>> UserManager;
    protected readonly Mock<IPasswordHasher<User>> PasswordHasher = new();
    protected readonly Mock<IJwtTokenService> JwtTokenService = new();
    protected readonly Mock<IAuthCookieHandler> AuthCookieHandler = new();
    protected readonly Mock<IRefreshTokenRepository> RefreshTokenRepository = new();
    protected readonly Mock<IEventRepository> EventRepository = new();
    protected readonly List<Event> RecordedEvents = [];
    protected readonly AuthenticationCommandService AuthenticationCommandService;

    protected AuthenticationCommandServiceSetup()
    {
        UserManager = new Mock<UserManager<User>>(
            Mock.Of<IUserStore<User>>(), null!, null!, null!, null!, null!, null!, null!, null!);

        var clock = new Mock<IClock>();
        clock.Setup(c => c.GetCurrentInstant()).Returns(Now);

        EventRepository
            .Setup(r => r.SaveAsync(It.IsAny<Event>()))
            .Callback<Event>(RecordedEvents.Add)
            .ReturnsAsync(true);

        PasswordHasher
            .Setup(h => h.HashPassword(It.IsAny<User>(), It.IsAny<string>()))
            .Returns("hash-ficticio-de-equalizacao");

        JwtTokenService.Setup(j => j.HashToken(It.IsAny<string>())).Returns<string>(raw => $"hash-de-{raw}");
        JwtTokenService.Setup(j => j.CreateAccessToken(It.IsAny<User>(), It.IsAny<string>())).Returns("access-ficticio");
        JwtTokenService.Setup(j => j.CreateRefreshToken()).Returns(("refresh-cru-novo", "hash-de-refresh-cru-novo"));

        RefreshTokenRepository.Setup(r => r.SaveAsync(It.IsAny<RefreshToken>())).ReturnsAsync(true);
        RefreshTokenRepository.Setup(r => r.RevokeByIdAsync(It.IsAny<Guid>(), It.IsAny<Instant>())).ReturnsAsync(true);

        UserManager.Setup(u => u.GetRolesAsync(It.IsAny<User>())).ReturnsAsync(["Administrator"]);

        AuthenticationCommandService = new AuthenticationCommandService(
            Notification,
            Mock.Of<ILoggerHandler>(),
            UserManager.Object,
            PasswordHasher.Object,
            JwtTokenService.Object,
            AuthCookieHandler.Object,
            RefreshTokenRepository.Object,
            new AuthEventRecorder(EventRepository.Object, clock.Object),
            clock.Object,
            new JwtTokenOptions
            {
                JwtKey = "chave-ficticia-de-teste-com-32-bytes-ou-mais",
                Issuer = "emissor-ficticio",
                Audience = "audiencia-ficticia",
                AccessTokenMinutes = 15,
                RefreshTokenMinutes = 30
            });
    }

    protected string SingleNotificationMessage() => Assert.Single(Notification.GetNotifications()).Value;
}
