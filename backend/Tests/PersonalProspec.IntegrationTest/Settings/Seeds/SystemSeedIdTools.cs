using PersonalProspec.Domain.Constants;

namespace PersonalProspec.IntegrationTest.Settings.Seeds;

// Valores FICTÍCIOS do host de teste: nunca reaproveitar segredo real.
public static class SystemSeedIdTools
{
    public static readonly Guid BusinessUnitId = SystemSeedId.BusinessUnitId;
    public static readonly Guid AdministratorRoleId = SystemSeedId.AdministratorRoleId;

    public const string TestEmail = "conta.teste@exemplo.test";
    public const string TestPassword = "senha-ficticia-de-teste-1";
}
