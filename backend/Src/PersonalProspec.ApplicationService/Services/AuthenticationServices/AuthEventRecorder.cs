using NodaTime;
using PersonalProspec.Domain.Entities;
using PersonalProspec.Domain.Enums;
using PersonalProspec.Domain.Interfaces.RepositoryContracts;

namespace PersonalProspec.ApplicationService.Services.AuthenticationServices;

// Grava eventos de autenticação (FR-012) na tabela Event. A descrição nunca contém senha, token nem link.
public sealed class AuthEventRecorder(IEventRepository eventRepository, IClock clock)
{
    public const string LoginSucceeded = nameof(LoginSucceeded);
    public const string LoginFailed = nameof(LoginFailed);
    public const string LoginLockedOut = nameof(LoginLockedOut);
    public const string RefreshReuseDetected = nameof(RefreshReuseDetected);
    public const string Logout = nameof(Logout);

    public async Task RecordAsync(string type, Guid businessUnitId, string description)
    {
        await eventRepository.SaveAsync(new Event
        {
            Category = EEventCategory.Auth,
            Type = type,
            Description = description,
            Source = "Authentication",
            OccurredAt = clock.GetCurrentInstant(),
            BusinessUnitId = businessUnitId
        });
    }
}
