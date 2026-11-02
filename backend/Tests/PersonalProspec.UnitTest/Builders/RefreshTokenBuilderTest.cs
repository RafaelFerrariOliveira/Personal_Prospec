using NodaTime;
using PersonalProspec.Domain.Constants;
using PersonalProspec.Domain.Entities.Identity;

namespace PersonalProspec.UnitTest.Builders;

public sealed class RefreshTokenBuilderTest
{
    private Guid _id = Guid.NewGuid();
    private Guid _userId = Guid.NewGuid();
    private string _tokenHash = "hash-ficticio-do-refresh";
    private Instant _expiresAt = Instant.FromUtc(2026, 11, 2, 13, 0, 0);
    private Instant? _revokedAt;
    private Guid _businessUnitId = SystemSeedId.BusinessUnitId;

    public static RefreshTokenBuilderTest NewObject() => new();

    public RefreshToken Build() =>
        new()
        {
            Id = _id,
            UserId = _userId,
            TokenHash = _tokenHash,
            ExpiresAt = _expiresAt,
            RevokedAt = _revokedAt,
            CreatedAt = Instant.FromUtc(2026, 11, 2, 12, 0, 0),
            BusinessUnitId = _businessUnitId
        };

    public RefreshTokenBuilderTest WithId(Guid id) { _id = id; return this; }
    public RefreshTokenBuilderTest WithUserId(Guid userId) { _userId = userId; return this; }
    public RefreshTokenBuilderTest WithTokenHash(string tokenHash) { _tokenHash = tokenHash; return this; }
    public RefreshTokenBuilderTest WithExpiresAt(Instant expiresAt) { _expiresAt = expiresAt; return this; }
    public RefreshTokenBuilderTest WithRevokedAt(Instant? revokedAt) { _revokedAt = revokedAt; return this; }
    public RefreshTokenBuilderTest WithBusinessUnitId(Guid businessUnitId) { _businessUnitId = businessUnitId; return this; }
}
