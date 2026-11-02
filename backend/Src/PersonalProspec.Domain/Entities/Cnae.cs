namespace PersonalProspec.Domain.Entities;

// Dado público de referência (Receita), sem BusinessUnitId (decisão P4 da spec 001).
public sealed class Cnae
{
    public required string Code { get; init; }
    public required string Description { get; set; }
}
