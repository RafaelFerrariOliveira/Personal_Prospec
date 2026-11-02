using PersonalProspec.Domain.Constants;
using PersonalProspec.Domain.Entities.Identity;

namespace PersonalProspec.UnitTest.Builders;

public sealed class UserBuilderTest
{
    private Guid _id = Guid.NewGuid();
    private string _email = "teste@exemplo.test";
    private string _securityStamp = "stamp-ficticio-0001";
    private string _passwordHash = "hash-ficticio";
    private Guid _roleId = SystemSeedId.AdministratorRoleId;
    private Guid _businessUnitId = SystemSeedId.BusinessUnitId;

    public static UserBuilderTest NewObject() => new();

    public User Build() =>
        new()
        {
            Id = _id,
            Email = _email,
            NormalizedEmail = _email.ToUpperInvariant(),
            PasswordHash = _passwordHash,
            SecurityStamp = _securityStamp,
            RoleId = _roleId,
            BusinessUnitId = _businessUnitId
        };

    public UserBuilderTest WithId(Guid id) { _id = id; return this; }
    public UserBuilderTest WithEmail(string email) { _email = email; return this; }
    public UserBuilderTest WithSecurityStamp(string securityStamp) { _securityStamp = securityStamp; return this; }
    public UserBuilderTest WithBusinessUnitId(Guid businessUnitId) { _businessUnitId = businessUnitId; return this; }
}
