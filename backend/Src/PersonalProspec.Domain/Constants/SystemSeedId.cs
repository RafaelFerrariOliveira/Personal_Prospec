namespace PersonalProspec.Domain.Constants;

// Identificadores fixos criados pelo seed. Não existe tabela de unidade de negócio: o BusinessUnitId
// é um Guid fixo gravado na conta e no claim BusinessUnit (premissa do plan.md da spec 002).
public static class SystemSeedId
{
    public static readonly Guid BusinessUnitId = new("7f3b1c52-8d41-4a0e-9b6e-2c5a4d1e8f01");
    public static readonly Guid AdministratorRoleId = new("a1d4e6b9-3c72-4f58-8e0a-6b9d2f7c3e14");
}
