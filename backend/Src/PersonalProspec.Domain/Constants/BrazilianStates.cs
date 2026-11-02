namespace PersonalProspec.Domain.Constants;

// As 26 UF e o DF, lista fixa. O código é o mesmo de Municipality.State.
public static class BrazilianStates
{
    public sealed record State(string Code, string Name);

    public static readonly IReadOnlyList<State> All =
    [
        new("AC", "Acre"),
        new("AL", "Alagoas"),
        new("AP", "Amapá"),
        new("AM", "Amazonas"),
        new("BA", "Bahia"),
        new("CE", "Ceará"),
        new("DF", "Distrito Federal"),
        new("ES", "Espírito Santo"),
        new("GO", "Goiás"),
        new("MA", "Maranhão"),
        new("MT", "Mato Grosso"),
        new("MS", "Mato Grosso do Sul"),
        new("MG", "Minas Gerais"),
        new("PA", "Pará"),
        new("PB", "Paraíba"),
        new("PR", "Paraná"),
        new("PE", "Pernambuco"),
        new("PI", "Piauí"),
        new("RJ", "Rio de Janeiro"),
        new("RN", "Rio Grande do Norte"),
        new("RS", "Rio Grande do Sul"),
        new("RO", "Rondônia"),
        new("RR", "Roraima"),
        new("SC", "Santa Catarina"),
        new("SP", "São Paulo"),
        new("SE", "Sergipe"),
        new("TO", "Tocantins")
    ];

    public static bool IsValid(string? code) => All.Any(s => s.Code == code);
}
