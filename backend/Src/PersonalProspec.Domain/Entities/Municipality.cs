namespace PersonalProspec.Domain.Entities;

// Dado público de referência (Receita), sem BusinessUnitId (decisão P4 da spec 001).
// Code é o código do município na Receita, o mesmo usado em Estabelecimentos.
public sealed class Municipality
{
    public required string Code { get; init; }
    public required string State { get; init; }
    public required string Name { get; set; }
}
