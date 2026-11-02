using Microsoft.AspNetCore.Identity;
using NodaTime;
using PersonalProspec.ApplicationService.Dtos.AuthenticationDtos.Request;
using PersonalProspec.ApplicationService.Interfaces.ServiceContracts;
using PersonalProspec.ApplicationService.Traces;
using PersonalProspec.Domain.Entities.Identity;
using PersonalProspec.Domain.Extensions;
using PersonalProspec.Domain.Handlers.NotificationSettings;
using PersonalProspec.Domain.Interfaces;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;
using PersonalProspec.Domain.Providers;

namespace PersonalProspec.ApplicationService.Services.AuthenticationServices;

public sealed class AuthenticationCommandService(
    INotificationHandler notification,
    ILoggerHandler loggerHandler,
    UserManager<User> userManager,
    IPasswordHasher<User> passwordHasher,
    IJwtTokenService jwtTokenService,
    IAuthCookieHandler authCookieHandler,
    IRefreshTokenRepository refreshTokenRepository,
    AuthEventRecorder eventRecorder,
    IClock clock,
    JwtTokenOptions jwtTokenOptions)
    : ServiceBase(notification, loggerHandler), IAuthenticationCommandService
{
    // Hash válido de uma senha qualquer: serve para gastar o mesmo tempo quando o e-mail não existe
    // (evita descobrir a existência da conta pela diferença de tempo de resposta).
    private static string? _dummyHash;

    public async Task<bool> LoginAsync(LoginRequest request)
    {
        var email = NormalizeEmail(request.Email);
        var password = request.Password ?? string.Empty;

        var user = email.Length == 0 ? null : await userManager.FindByEmailAsync(email);

        if (user is null)
        {
            SpendEquivalentHashingTime(password);
            return await InvalidCredentialsAsync(Guid.Empty, "Falha de entrada: conta não identificada.");
        }

        if (await userManager.IsLockedOutAsync(user))
            return await LockedOutAsync(user);

        if (password.Length == 0 || !await userManager.CheckPasswordAsync(user, password))
        {
            await userManager.AccessFailedAsync(user);

            return await userManager.IsLockedOutAsync(user)
                ? await LockedOutAsync(user)
                : await InvalidCredentialsAsync(user.BusinessUnitId, "Falha de entrada: credenciais inválidas.");
        }

        await userManager.ResetAccessFailedCountAsync(user);
        await IssueSessionAsync(user);
        await eventRecorder.RecordAsync(AuthEventRecorder.LoginSucceeded, user.BusinessUnitId, "Entrada no sistema.");

        return true;
    }

    public async Task<bool> LogoutAsync(Guid userId, Guid businessUnitId)
    {
        // O cookie de refresh tem Path restrito ao endpoint de refresh, então o navegador não o envia ao
        // logout. Por isso o logout revoga TODOS os refresh do usuário autenticado (o id vem do JWT, cujo
        // tenant já foi conferido na validação do token), não o do cookie.
        await refreshTokenRepository.RevokeAllByUserAsync(userId, clock.GetCurrentInstant());

        authCookieHandler.ClearSession();
        await eventRecorder.RecordAsync(AuthEventRecorder.Logout, businessUnitId, "Saída do sistema.");

        return true;
    }

    public async Task<bool> RefreshTokenAsync()
    {
        var raw = authCookieHandler.GetRefreshToken();
        if (raw is null)
            return SessionExpired();

        var stored = await refreshTokenRepository.FindByTokenHashAsync(jwtTokenService.HashToken(raw));
        if (stored is null)
        {
            authCookieHandler.ClearSession();
            return SessionExpired();
        }

        var now = clock.GetCurrentInstant();

        // Refresh já revogado sendo reapresentado: possível roubo. Revoga todos os do usuário.
        if (stored.RevokedAt is not null)
        {
            await refreshTokenRepository.RevokeAllByUserAsync(stored.UserId, now);
            await eventRecorder.RecordAsync(AuthEventRecorder.RefreshReuseDetected, stored.BusinessUnitId,
                "Reuso de token de renovação já revogado: todas as sessões do usuário foram encerradas.");
            authCookieHandler.ClearSession();
            return SessionExpired();
        }

        if (stored.ExpiresAt <= now)
        {
            authCookieHandler.ClearSession();
            return SessionExpired();
        }

        var user = await userManager.FindByIdAsync(stored.UserId.ToString());
        if (user is null || user.BusinessUnitId != stored.BusinessUnitId)
        {
            authCookieHandler.ClearSession();
            return SessionExpired();
        }

        // Rotação: o refresh usado é revogado e um novo par é emitido.
        await refreshTokenRepository.RevokeByIdAsync(stored.Id, now);
        await IssueSessionAsync(user);

        return true;
    }

    private async Task IssueSessionAsync(User user)
    {
        var now = clock.GetCurrentInstant();
        var roles = await userManager.GetRolesAsync(user);
        var accessToken = jwtTokenService.CreateAccessToken(user, roles.FirstOrDefault() ?? string.Empty);
        var (refreshRaw, refreshHash) = jwtTokenService.CreateRefreshToken();

        await refreshTokenRepository.SaveAsync(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = refreshHash,
            ExpiresAt = now.Plus(Duration.FromMinutes(jwtTokenOptions.RefreshTokenMinutes)),
            CreatedAt = now,
            BusinessUnitId = user.BusinessUnitId
        });

        authCookieHandler.SetSession(accessToken, refreshRaw);
    }

    private async Task<bool> InvalidCredentialsAsync(Guid businessUnitId, string description)
    {
        // Conta inexistente grava o evento com o tenant fixo do seed (não há usuário para dar o tenant).
        var tenant = businessUnitId == Guid.Empty ? Domain.Constants.SystemSeedId.BusinessUnitId : businessUnitId;
        await eventRecorder.RecordAsync(AuthEventRecorder.LoginFailed, tenant, description);

        return Notification.CreateNotification(AuthenticationTrace.Login, EMessage.InvalidCredentials.GetDescription());
    }

    private async Task<bool> LockedOutAsync(User user)
    {
        var lockoutEnd = await userManager.GetLockoutEndDateAsync(user);
        var remaining = lockoutEnd is null
            ? TimeSpan.Zero
            : lockoutEnd.Value - clock.GetCurrentInstant().ToDateTimeOffset();

        await eventRecorder.RecordAsync(AuthEventRecorder.LoginLockedOut, user.BusinessUnitId,
            "Tentativa de entrada com a conta temporariamente bloqueada.");

        return Notification.CreateNotification(
            AuthenticationTrace.Login,
            EMessage.LockedOut.GetDescription().FormatTo(FormatRemaining(remaining)));
    }

    private bool SessionExpired() =>
        Notification.CreateNotification(AuthenticationTrace.RefreshToken, EMessage.SessionExpired.GetDescription());

    private void SpendEquivalentHashingTime(string password)
    {
        var dummyUser = new User { Email = string.Empty, NormalizedEmail = string.Empty, PasswordHash = string.Empty, SecurityStamp = string.Empty };
        _dummyHash ??= passwordHasher.HashPassword(dummyUser, "tempo-de-resposta-equivalente");
        passwordHasher.VerifyHashedPassword(dummyUser, _dummyHash, password);
    }

    private static string NormalizeEmail(string? email) => (email ?? string.Empty).Trim().ToLowerInvariant();

    private static string FormatRemaining(TimeSpan remaining) =>
        remaining <= TimeSpan.FromMinutes(1)
            ? "menos de 1 minuto"
            : $"{(int)Math.Ceiling(remaining.TotalMinutes)} minutos";
}
